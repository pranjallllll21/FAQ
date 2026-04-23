import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const conn = await mongoose.connect(process.env.MONGODB_URI);

const userQuestionSchema = new mongoose.Schema({}, { collection: 'userquestions', strict: false });
const UserQuestion = mongoose.model('UserQuestion', userQuestionSchema);

const faqSchema = new mongoose.Schema({}, { collection: 'faqs', strict: false });
const FAQ = mongoose.model('FAQ', faqSchema);

console.log('\n📊 CHECKING FREQUENT QUESTIONS (askCount >= 3):\n');
const frequentQuestions = await UserQuestion.find({ askCount: { $gte: 3 } }).sort({ askCount: -1 });
console.log(`Found ${frequentQuestions.length} questions with askCount >= 3:`);
frequentQuestions.forEach((q, i) => {
  console.log(`${i+1}. "${q.question}" - Asked ${q.askCount} times - Converted to FAQ: ${q.isConvertedToFAQ}`);
});

console.log('\n🎯 CHECKING TOTAL FAQs IN DATABASE:\n');
const totalFAQs = await FAQ.countDocuments();
console.log(`Total FAQs: ${totalFAQs}`);

console.log('\n📝 CHECKING ALL USER QUESTIONS:\n');
const allQuestions = await UserQuestion.find({}).sort({ askCount: -1 }).limit(20);
console.log(`Total user questions in DB: ${await UserQuestion.countDocuments()}`);
console.log('First 20 questions by ask count:');
allQuestions.forEach((q, i) => {
  console.log(`${i+1}. "${q.question}" - Asked ${q.askCount} times`);
});

process.exit(0);
