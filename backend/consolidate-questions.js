import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import UserQuestion from './models/UserQuestion.js';

const conn = await mongoose.connect(process.env.MONGODB_URI);

console.log('\n🧹 CONSOLIDATING DUPLICATE QUESTIONS...\n');

// Find all questions and group by normalized form
const allQuestions = await UserQuestion.find({});
const grouped = {};

allQuestions.forEach(q => {
  const normalized = q.question.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[?!.;:,]+$/g, '');
  if (!grouped[normalized]) {
    grouped[normalized] = [];
  }
  grouped[normalized].push(q);
});

// Process groups with duplicates
let consolidatedCount = 0;
for (const [normalized, questions] of Object.entries(grouped)) {
  if (questions.length > 1) {
    console.log(`Found ${questions.length} variations of: "${normalized}"`);
    
    // Keep the first one, delete others
    const keeper = questions[0];
    const toDelete = questions.slice(1);
    
    // Sum up ask counts
    let totalAsks = 0;
    questions.forEach(q => {
      totalAsks += (q.askCount || 1);
    });
    
    keeper.askCount = totalAsks;
    await keeper.save();
    
    // Delete duplicates
    for (const dup of toDelete) {
      await UserQuestion.deleteOne({ _id: dup._id });
    }
    
    console.log(`  ✅ Consolidated to "${keeper.question}" with total ${totalAsks} asks`);
    consolidatedCount++;
  }
}

console.log(`\n✅ Consolidated ${consolidatedCount} groups of duplicates\n`);

// Show final status
const finalQuestions = await UserQuestion.find({}).sort({ askCount: -1 });
console.log('📊 FINAL QUESTION STATUS:\n');
finalQuestions.forEach((q, i) => {
  console.log(`${i+1}. "${q.question}" - Asked ${q.askCount} times - Converted: ${q.isConvertedToFAQ}`);
});

process.exit(0);
