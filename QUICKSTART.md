# Quick Start Guide - Smart FAQ Accordion

Get up and running in 5 minutes!

## 🚀 Quickstart (Local)

### 1. Setup Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Optional: Configure MongoDB
# Default: mongodb://localhost:27017/smart-faq
# Edit .env if using different MongoDB

# Seed sample data
node seed.js

# Start server
npm run dev
```

✅ Backend running at `http://localhost:5000`

### 2. Setup Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dev server
npm run dev
```

✅ Frontend running at `http://localhost:5173`

## 3. Open in Browser

Open `http://localhost:5173` in your browser. You should see:
- ✅ FAQ accordion with 12 sample items
- ✅ Voice input button
- ✅ Search bar with filters
- ✅ Dark mode toggle
- ✅ Ask question button

## 🎤 Testing Features

### 1. Test Voice Input
- Click the microphone button 🎤
- Say a question (e.g., "How do I install Node.js?")
- Watch the transcript appear
- See suggested FAQs automatically

### 2. Test Rate Limiting (5 min)
- Click "Ask a Question" button
- Submit 5 questions within 5 minutes
- On 6th attempt, see rate limit modal
- Countdown timer shows when you can ask again

### 3. Test Search
- Type in search box (e.g., "React")
- Results filter in real-time
- Use category dropdown to narrow down

### 4. Test Like/Dislike
- Expand any FAQ
- Click 👍 or 👎 buttons
- Count updates visually

### 5. Test Dark Mode
- Click moon/sun icon in header
- Theme persists on refresh (localStorage)

## 📊 Rate Limiting Deep Dive

### How It Works

```javascript
// Max 5 questions per 5 minutes
// Uses Sliding Window Algorithm

Timeline:
- 0:00 - User asks question 1 ✅
- 2:00 - User asks question 2 ✅
- 4:00 - User asks question 3 ✅
- 4:30 - User asks question 4 ✅
- 4:45 - User asks question 5 ✅
- 4:50 - User asks question 6 ❌ BLOCKED! "Try again in 70 seconds"
- 5:50 - Oldest request expires, user can ask again ✅
```

### Algorithm Complexity
- **Time**: O(n) per request (n = requests in window)
- **Space**: O(n) to store timestamps
- **Alternative**: Queue approach is O(1) for operations

## 🗂️ File Structure Quick Reference

```
backend/
├── server.js              ← Main entry point
├── seed.js               ← Run to populate DB
├── middleware/
│   └── rateLimiter.js    ← Rate limiting logic
├── utils/
│   ├── slidingWindow.js  ← Sliding Window DSA
│   └── queueRateLimiter.js ← Alternative DSA
└── routes/
    ├── faqs.js           ← FAQ CRUD
    ├── questions.js      ← Questions + rate limiting
    └── reactions.js      ← Like/dislike

frontend/
├── src/
│   ├── App.jsx           ← Main component
│   ├── components/
│   │   ├── FAQAccordion.jsx      ← Accordion logic
│   │   ├── VoiceAgent.jsx        ← Voice input
│   │   └── AskQuestionModal.jsx  ← Question form + rate limit UI
│   └── utils/
│       ├── api.js        ← API calls
│       ├── voice.js      ← Web Speech API wrapper
│       └── theme.js      ← Dark mode logic
└── index.html
```

## 🔧 Customization

### Change Rate Limit Settings
Edit `backend/middleware/rateLimiter.js`:

```javascript
// Default: 5 questions per 5 minutes
const rateLimiter = new SlidingWindowRateLimiter(
  5,                    // maxRequests
  5 * 60 * 1000        // windowSizeMs (milliseconds)
);

// Example: Allow 10 questions per 10 minutes
const rateLimiter = new SlidingWindowRateLimiter(
  10,
  10 * 60 * 1000
);
```

### Change Colors/Theme
Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Change primary color
    600: '#0284c7',
  }
}
```

### Add More Sample FAQs
Edit `backend/seed.js` and add to `sampleFAQs` array:

```javascript
{
  question: 'Your question?',
  answer: 'Your answer?',
  category: 'Technical',
  tags: ['tag1', 'tag2'],
}
```

Then run: `node seed.js`

## 📦 Production Build

### Backend

```bash
cd backend
npm start  # Uses NODE_ENV=production
```

### Frontend

```bash
cd frontend
npm run build
# Creates optimized build in dist/
npm run preview  # Preview production build locally
```

## 🔌 Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017/smart-faq
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## ✅ Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected and seeded
- [ ] Can see sample FAQs loaded
- [ ] Voice input works (in Chrome/Edge)
- [ ] Rate limiting triggered after 5 questions
- [ ] Dark mode toggle works
- [ ] Like/dislike updates counts
- [ ] Search filters FAQs
- [ ] Ask question modal opens

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check `CORS_ORIGIN` in backend `.env` |
| Cannot connect to MongoDB | Ensure MongoDB is running, check connection string |
| Voice not working | Use Chrome/Edge, check microphone permissions |
| Rate limit not working | Restart backend, check middleware is applied |
| Tailwind not styling | Run `npm install` again, restart dev server |

## 📞 Next Steps

1. **Add Authentication** - Implement JWT for user login
2. **Admin Panel** - Create dashboard to manage FAQs
3. **API Caching** - Add Redis for faster responses
4. **Email Notifications** - Send emails for new questions
5. **Analytics** - Track FAQ views and searches
6. **Advanced Voice** - Implement Text-to-Speech responses

## 💡 Tips

- Use browser DevTools to inspect rate limit headers
- Check backend console for detailed logging
- Test voice in quiet environment for better accuracy
- Use MongoDB Compass to visualize database

---

**Enjoy building! 🚀**
