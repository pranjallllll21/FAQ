import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import UserQuestion from './models/UserQuestion.js';
import FAQ from './models/FAQ.js';

const conn = await mongoose.connect(process.env.MONGODB_URI);

console.log('\n🔄 CONVERTING EXISTING FREQUENT QUESTIONS TO FAQs...\n');

// Find all questions with 2+ asks that haven't been converted yet
const questionsToConvert = await UserQuestion.find({
  askCount: { $gte: 2 },
  isConvertedToFAQ: false,
});

if (questionsToConvert.length === 0) {
  console.log('✅ No pending questions to convert');
  process.exit(0);
}

for (const q of questionsToConvert) {
  try {
    // Check if FAQ already exists
    const existingFAQ = await FAQ.findOne({
      question: new RegExp(`^${q.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });

    if (existingFAQ) {
      console.log(`⚠️  FAQ for "${q.question}" already exists`);
      q.isConvertedToFAQ = true;
      q.faqId = existingFAQ._id;
      await q.save();
      continue;
    }

    // Create FAQ
    const newFAQ = new FAQ({
      question: q.question.charAt(0).toUpperCase() + q.question.slice(1),
      answer: `This is a frequently asked question (asked ${q.askCount} times). Please provide a detailed answer for this FAQ.`,
      category: q.category || 'General',
      tags: [q.category || 'General', 'auto-created', 'frequent'],
      isActive: true,
    });

    const savedFAQ = await newFAQ.save();

    // Update user question
    q.isConvertedToFAQ = true;
    q.faqId = savedFAQ._id;
    await q.save();

    console.log(`✅ Converted "${q.question}" (${q.askCount} asks) to FAQ ID: ${savedFAQ._id}`);
  } catch (err) {
    console.error(`❌ Error converting "${q.question}":`, err.message);
  }
}

console.log('\n✅ Conversion complete!\n');

// Show final status
const faqCount = await FAQ.countDocuments();
const convertedQuestions = await UserQuestion.find({ isConvertedToFAQ: true });

console.log(`📊 FINAL STATUS:`);
console.log(`   Total FAQs: ${faqCount}`);
console.log(`   Questions converted to FAQ: ${convertedQuestions.length}`);

process.exit(0);
