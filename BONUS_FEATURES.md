# Bonus Features & Advanced Setup

This document covers bonus features and advanced configurations for the Smart FAQ application.

## 🎁 Bonus Features Implemented

### 1. Like/Dislike System ✅
Users can rate FAQ helpfulness:
- Click 👍 to like an FAQ
- Click 👎 to dislike
- Prevents duplicate votes using IP-based tracking
- Real-time count updates

**Implementation:**
- Backend: `/api/reactions/like/:id` and `/api/reactions/dislike/:id`
- Frontend: Like/dislike buttons in FAQ accordion items
- Storage: User votes tracked in `userLikes` and `userDislikes` arrays

---

### 2. Tag-Based Filtering ✅
FAQs organized with tags for better navigation:
- Display tags under each FAQ question
- Filter by multiple tags
- Tag-based search integration

**Sample Tags:**
```
React, Frontend, JavaScript, Node.js, Backend, 
MongoDB, Database, MERN, API, Authentication, etc.
```

**Extension:**
```javascript
// Add advanced tag filtering
const filterByTags = (faqs, selectedTags) => {
  if (!selectedTags.length) return faqs;
  return faqs.filter(faq =>
    selectedTags.some(tag => faq.tags.includes(tag))
  );
};
```

---

### 3. Admin Panel Foundation ✅

Backend APIs are ready for admin implementation:

```javascript
// Create FAQ (Admin)
POST /api/faqs
{
  "question": "New FAQ",
  "answer": "Answer text",
  "category": "Technical",
  "tags": ["important"]
}

// Update FAQ (Admin)
PUT /api/faqs/:id
{ /* updated fields */ }

// Delete FAQ (Admin)
DELETE /api/faqs/:id

// Get all user questions (Admin)
GET /api/questions

// Update question status (Admin)
PUT /api/questions/:id
{
  "status": "answered",
  "relatedFAQId": "507f1f77bcf86cd799439011"
}
```

**To Build Admin UI:**
```bash
# Create admin folder structure
mkdir -p frontend/src/pages/admin
mkdir -p frontend/src/components/admin
```

**Example Admin Component:**
```jsx
// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { faqAPI, questionAPI } from '../../utils/api';

export default function AdminDashboard() {
  const [faqs, setFaqs] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Fetch all FAQs and questions for admin
    faqAPI.getAll().then(res => setFaqs(res.data));
    questionAPI.getAll().then(res => setQuestions(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* FAQ Management */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Manage FAQs</h2>
        {/* List FAQs with edit/delete options */}
      </div>

      {/* Question Management */}
      <div>
        <h2 className="text-2xl font-bold mb-4">User Questions</h2>
        {/* List questions with status update */}
      </div>
    </div>
  );
}
```

---

## 🚀 Advanced Features to Add

### 1. Authentication & Authorization

```bash
# Install JWT packages
cd backend
npm install jsonwebtoken bcryptjs
```

**Backend Implementation:**
```javascript
// backend/models/User.js
const userSchema = new Schema({
  email: { type: String, unique: true },
  password: { type: String },
  role: { enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

// backend/routes/auth.js
router.post('/login', async (req, res) => {
  // Verify credentials and return JWT
});

router.post('/register', async (req, res) => {
  // Create user with hashed password
});
```

**Protect Routes:**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use on protected routes
router.post('/api/faqs', authMiddleware, createFAQ);
```

---

### 2. Email Notifications

```bash
cd backend
npm install nodemailer
```

**Send email when question is answered:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendNotification(email, faqId) {
  await transporter.sendMail({
    to: email,
    subject: 'Your Question has been answered!',
    html: `<p>Check out our FAQ: ${faqId}</p>`
  });
}
```

---

### 3. Caching with Redis

```bash
npm install redis
```

**Cache FAQ results:**
```javascript
const redis = require('redis');
const client = redis.createClient();

router.get('/api/faqs', async (req, res) => {
  const cacheKey = 'faqs:all';
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch and cache
  const faqs = await FAQ.find();
  await client.setex(cacheKey, 3600, JSON.stringify(faqs)); // 1 hour
  
  res.json({ data: faqs });
});
```

---

### 4. Analytics & Metrics

Track user engagement:

```javascript
// backend/models/Analytics.js
const analyticsSchema = new Schema({
  eventType: String, // 'view', 'like', 'question', etc.
  faqId: mongoose.Schema.Types.ObjectId,
  userIP: String,
  timestamp: { type: Date, default: Date.now }
});

// backend/routes/analytics.js
router.get('/stats', async (req, res) => {
  const stats = {
    totalViews: await Analytics.countDocuments({ eventType: 'view' }),
    totalLikes: await Analytics.countDocuments({ eventType: 'like' }),
    totalQuestions: await Analytics.countDocuments({ eventType: 'question' })
  };
  res.json(stats);
});
```

---

### 5. Advanced Search with Elasticsearch

```bash
npm install @elastic/elasticsearch
```

**Index FAQs:**
```javascript
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

async function indexFAQ(faq) {
  await client.index({
    index: 'faqs',
    id: faq._id.toString(),
    body: {
      question: faq.question,
      answer: faq.answer,
      tags: faq.tags
    }
  });
}
```

---

### 6. Text-to-Speech Responses

```javascript
// frontend/src/utils/tts.js
export const speakAnswer = (answerText) => {
  const utterance = new SpeechSynthesisUtterance(answerText);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};
```

**Add button to FAQ items:**
```jsx
<button onClick={() => speakAnswer(faq.answer)}>
  🔊 Read Aloud
</button>
```

---

### 7. Content Moderation

```javascript
// backend/middleware/moderation.js
const moderateContent = (req, res, next) => {
  const { question, answer } = req.body;
  
  // Check for inappropriate content
  const bannedWords = ['inappropriate'];
  const hasBannedContent = bannedWords.some(word =>
    question.includes(word) || answer.includes(word)
  );
  
  if (hasBannedContent) {
    return res.status(400).json({ 
      error: 'Content contains inappropriate words' 
    });
  }
  
  next();
};
```

---

### 8. Automated FAQ Suggestions

Using AI/ML:

```bash
npm install openai
```

**Generate FAQ answers using OpenAI:**
```javascript
const OpenAI = require('openai');
const openai = new OpenAI();

async function generateAnswer(question) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: `Answer this question: ${question}` }
    ]
  });
  return response.choices[0].message.content;
}
```

---

### 9. Multi-language Support

```bash
npm install i18next react-i18next
```

**Add translations:**
```javascript
// frontend/src/locales/en.json
{
  "header.title": "Smart FAQ",
  "button.question": "Ask a Question",
  "modal.rate_limit": "Rate limit exceeded"
}

// frontend/src/locales/es.json
{
  "header.title": "Preguntas Frecuentes Inteligentes",
  "button.question": "Hacer una Pregunta",
  "modal.rate_limit": "Límite de velocidad excedido"
}
```

---

### 10. Analytics Dashboard

```jsx
// frontend/src/pages/AnalyticsDashboard.jsx
export default function AnalyticsDashboard() {
  return (
    <div className="p-8">
      <h1>Analytics & Statistics</h1>
      
      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Views" value="1,234" />
        <Card title="Total Likes" value="456" />
        <Card title="Total Questions" value="78" />
      </div>
      
      {/* Popular FAQs */}
      <PopularFAQsList />
      
      {/* Search Trends */}
      <SearchTrends />
    </div>
  );
}
```

---

## 📊 Performance Optimization

### 1. Database Indexing

```javascript
// backend/models/FAQ.js
faqSchema.index({ question: 'text', answer: 'text' });
faqSchema.index({ category: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ createdAt: -1 });
```

### 2. Pagination

```javascript
// backend/routes/faqs.js
router.get('/', async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  
  const faqs = await FAQ.find()
    .skip(skip)
    .limit(limit);
  
  res.json({ data: faqs, page, totalPages: Math.ceil(count / limit) });
});
```

### 3. Lazy Loading

```jsx
// frontend/src/components/LazyFAQ.jsx
import { lazy, Suspense } from 'react';

const FAQAccordion = lazy(() => import('./FAQAccordion'));

export default function LazyFAQ() {
  return (
    <Suspense fallback={<div>Loading FAQs...</div>}>
      <FAQAccordion />
    </Suspense>
  );
}
```

---

## 🔐 Security Best Practices

1. **Validate Input**
```javascript
const { query, validationResult } = require('express-validator');

router.post('/questions/ask',
  query('question').trim().isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process
  }
);
```

2. **Rate Limiting (Already Implemented)**
3. **CORS Configuration**
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

4. **Helmet for Security Headers**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📦 Deployment Checklist

- [ ] Add authentication (JWT)
- [ ] Set up Redis caching
- [ ] Configure Elasticsearch for search
- [ ] Set up email notifications
- [ ] Add analytics tracking
- [ ] Enable content moderation
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups
- [ ] Add SSL certificate

---

## 🎯 Roadmap

**Phase 1** (Done ✅)
- Basic MERN setup
- FAQ accordion
- Rate limiting
- Voice input

**Phase 2** (Recommended)
- Authentication
- Admin panel
- Email notifications
- Analytics

**Phase 3** (Advanced)
- AI-powered suggestions
- Multi-language support
- Advanced search
- Caching

---

**Happy Building! 🚀**
