/**
 * Database seed script
 * Populates MongoDB with sample FAQ data
 * 
 * Run with: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FAQ = require('./models/FAQ');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-faq', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const sampleFAQs = [
  {
    question: 'What is React and why should I use it?',
    answer:
      'React is a JavaScript library for building user interfaces with reusable components. It provides efficient rendering through its virtual DOM, making it ideal for building dynamic and interactive web applications. React simplifies state management and allows for better code organization.',
    category: 'Technical',
    tags: ['React', 'Frontend', 'JavaScript'],
  },
  {
    question: 'How do I install Node.js?',
    answer:
      'Visit nodejs.org and download the LTS (Long Term Support) version. Run the installer and follow the on-screen instructions. After installation, verify by running `node --version` and `npm --version` in your terminal. Node.js includes npm by default.',
    category: 'Technical',
    tags: ['Node.js', 'Installation', 'Backend'],
  },
  {
    question: 'What is MongoDB and how does it differ from SQL databases?',
    answer:
      'MongoDB is a NoSQL database that stores data in JSON-like documents. Unlike SQL databases with rigid schemas, MongoDB offers flexible schemas. It\'s ideal for applications with rapidly changing data structures and provides horizontal scalability.',
    category: 'Technical',
    tags: ['MongoDB', 'Database', 'NoSQL'],
  },
  {
    question: 'How do I set up a MERN stack project?',
    answer:
      '1. Create a backend folder with Express and MongoDB setup. 2. Create a frontend folder using `npx create-react-app` or Vite. 3. Configure API endpoints in both frontend and backend. 4. Use environment variables for configuration. 5. Set up CORS middleware in Express. 6. Connect your frontend to backend APIs.',
    category: 'Technical',
    tags: ['MERN', 'Setup', 'Full-stack'],
  },
  {
    question: 'What is Tailwind CSS and how do I use it?',
    answer:
      'Tailwind CSS is a utility-first CSS framework that helps you build modern UIs quickly. Instead of writing CSS classes, you use pre-built utility classes directly in HTML/JSX. Install with `npm install -D tailwindcss`, configure tailwind.config.js, and import the CSS file in your project.',
    category: 'Technical',
    tags: ['Tailwind CSS', 'Styling', 'Frontend'],
  },
  {
    question: 'How do I deploy a MERN application?',
    answer:
      'You can deploy using Heroku, Vercel, Netlify, or cloud services like AWS, Google Cloud. For backend, use platforms like Heroku or Render. For frontend, use Vercel or Netlify. Set up environment variables in your deployment platform, connect your MongoDB Atlas database, and deploy your code through Git integration.',
    category: 'Support',
    tags: ['Deployment', 'Production', 'DevOps'],
  },
  {
    question: 'What is the Web Speech API and how can I use it?',
    answer:
      'The Web Speech API allows web applications to incorporate voice features. It has two main parts: SpeechRecognition (speech-to-text) and SpeechSynthesis (text-to-speech). Use SpeechRecognition to capture user voice input and convert it to text. Check browser compatibility before using.',
    category: 'Technical',
    tags: ['Web Speech API', 'Voice', 'JavaScript'],
  },
  {
    question: 'How do I handle authentication in a MERN app?',
    answer:
      'Use JWT (JSON Web Tokens) for stateless authentication. Create a login endpoint that returns a token, store it in localStorage/sessionStorage, send it in request headers for protected routes. Implement middleware to validate tokens on the backend. Consider using libraries like bcrypt for password hashing and jsonwebtoken for token management.',
    category: 'Technical',
    tags: ['Authentication', 'JWT', 'Security'],
  },
  {
    question: 'What are React Hooks and why are they useful?',
    answer:
      'React Hooks are functions that let you use state and other React features without writing class components. Common hooks include useState (manage state), useEffect (side effects), useContext (share data), and useReducer (complex state). They make code more reusable and easier to understand.',
    category: 'Technical',
    tags: ['React Hooks', 'Frontend', 'React'],
  },
  {
    question: 'How do I optimize my React application for performance?',
    answer:
      'Use React.memo to prevent unnecessary re-renders, implement code splitting with lazy loading, optimize images, use production builds, minimize bundle size, implement virtual scrolling for large lists, and use performance profiling tools. Consider using tools like Lighthouse and React DevTools Profiler.',
    category: 'Technical',
    tags: ['Performance', 'Optimization', 'React'],
  },
  {
    question: 'What payment methods do you support?',
    answer:
      'We support all major credit cards (Visa, Mastercard, American Express), debit cards, and digital payment methods including PayPal, Google Pay, and Apple Pay. All transactions are encrypted and PCI DSS compliant for your security.',
    category: 'Billing',
    tags: ['Payment', 'Billing', 'Support'],
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We offer a 30-day money-back guarantee for all plans. If you\'re not satisfied, contact our support team and we\'ll process a full refund. No questions asked. Some conditions may apply for special promotions.',
    category: 'Billing',
    tags: ['Refund', 'Policy', 'Support'],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('🗑️  Cleared existing FAQs');

    // Insert sample FAQs
    const createdFAQs = await FAQ.insertMany(sampleFAQs);
    console.log(`✅ Seeded ${createdFAQs.length} FAQs`);

    console.log('\nSample FAQs:');
    createdFAQs.forEach((faq, index) => {
      console.log(`${index + 1}. ${faq.question}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
