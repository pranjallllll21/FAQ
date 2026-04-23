# Smart FAQ Accordion - MERN Application

A full-stack FAQ application with AI voice agent integration, built with React, Node.js, Express, and MongoDB.

## 🎯 Features

### ✅ Core Features
- **FAQ Accordion UI**: Expandable/collapsible FAQ items with smooth animations
- **Light/Dark Mode**: Theme toggle with localStorage persistence
- **Ask Question**: Users can submit new questions (with rate limiting)
- **Rate Limiting**: Sliding Window Algorithm - Max 5 questions per 5 minutes
- **AI Voice Agent**: Speech-to-text using Web Speech API
- **Smart Search**: Full-text search with category and tag filtering
- **Like/Dislike**: Users can rate FAQ helpfulness
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🚀 Advanced Features
- **Glassmorphism UI**: Modern design with blur effects and glow animations
- **Suggested FAQs**: AI-powered FAQ suggestions based on user questions
- **Rate Limit Popup**: User-friendly modal when rate limit is exceeded
- **Admin Panel Ready**: Backend API for FAQ management
- **Tag-based Filtering**: Organize FAQs with tags

## 📁 Project Structure

```
faq/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── FAQ.js               # FAQ schema
│   │   └── UserQuestion.js      # User question schema
│   ├── routes/
│   │   ├── faqs.js              # FAQ endpoints
│   │   ├── questions.js         # Question endpoints (with rate limiting)
│   │   └── reactions.js         # Like/dislike endpoints
│   ├── middleware/
│   │   └── rateLimiter.js       # Rate limiter middleware
│   ├── utils/
│   │   ├── slidingWindow.js     # Sliding Window DSA implementation
│   │   └── queueRateLimiter.js  # Queue-based DSA (alternative)
│   ├── server.js                # Express app entry point
│   ├── seed.js                  # Database seeding script
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Top navigation
│   │   │   ├── SearchBar.jsx        # Search and filter
│   │   │   ├── FAQAccordion.jsx     # Main accordion component
│   │   │   ├── VoiceAgent.jsx       # Voice input component
│   │   │   ├── AskQuestionModal.jsx # Question submission modal
│   │   │   └── icons.jsx            # SVG icons
│   │   ├── utils/
│   │   │   ├── api.js              # API client
│   │   │   ├── theme.js            # Theme management
│   │   │   ├── voice.js            # Web Speech API wrapper
│   │   │   └── helpers.js          # Utility functions
│   │   ├── styles/
│   │   │   └── globals.css         # Global styles
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md (this file)
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Web Speech API** - Voice recognition

### DSA Implementation
- **Sliding Window Algorithm** - O(n) complexity for rate limiting
- **Queue Data Structure** - Alternative O(1) approach for rate limiting

## 📋 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
```

4. **Configure .env**
```env
MONGODB_URI=mongodb://localhost:27017/smart-faq
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-faq?retryWrites=true&w=majority
```

5. **Seed sample data**
```bash
node seed.js
```

6. **Start backend server**
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔄 Rate Limiting Implementation

### Sliding Window Algorithm (Used by Default)

```javascript
// Location: backend/utils/slidingWindow.js

// Time Complexity: O(n) where n = requests in window
// Space Complexity: O(n)

const rateLimiter = new SlidingWindowRateLimiter(5, 5 * 60 * 1000);
// Max 5 questions per 5 minutes

const result = rateLimiter.isAllowed(userIdentifier);
// Returns: { allowed, remainingRequests, resetTime }
```

**How it works:**
1. Maintains array of timestamps for each user
2. On each request, removes timestamps older than window (5 minutes)
3. If count >= 5, rejects request
4. Otherwise, adds timestamp and allows request

### Alternative: Queue-Based Approach

```javascript
// Location: backend/utils/queueRateLimiter.js

// Better for high-frequency checks
// Time Complexity: O(1) for enqueue/dequeue
// Space Complexity: O(n)

const rateLimiter = new QueueBasedRateLimiter(5, 5 * 60 * 1000);
```

## 📡 API Endpoints

### FAQs
- `GET /api/faqs` - Get all FAQs (with filters)
- `GET /api/faqs/:id` - Get single FAQ
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs/:id` - Update FAQ (admin)
- `DELETE /api/faqs/:id` - Delete FAQ (admin)

### Questions (with Rate Limiting)
- `POST /api/questions/ask` - Submit question (rate limited)
- `GET /api/questions` - Get all questions (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question

### Reactions
- `POST /api/reactions/like/:faqId` - Like FAQ
- `POST /api/reactions/dislike/:faqId` - Dislike FAQ

## 📝 Sample Data

The application comes with 12 sample FAQs covering:
- React fundamentals
- Node.js setup
- MongoDB concepts
- MERN stack setup
- Tailwind CSS
- Deployment
- Web Speech API
- Authentication
- React Hooks
- Performance optimization
- Payment methods
- Refund policy

Run `node seed.js` to populate the database.

## 🎨 UI/UX Features

### Design Elements
- **Glassmorphism**: Semi-transparent backgrounds with blur effect
- **Glow Effect**: Animated glow on hover
- **Smooth Transitions**: CSS transitions for all interactions
- **Responsive Layout**: Mobile-first design
- **Dark Mode**: Complete dark theme support

### Components
- Expandable accordion with smooth animations
- Voice input with real-time transcript display
- Rate limit modal with countdown timer
- Search bar with category filters
- Like/dislike buttons with visual feedback
- Loading and error states

## 🗣️ Web Speech API Integration

### Speech Recognition (Question Input)
```javascript
const { voiceAPI } = require('./utils/voice');

voiceAPI.startListening(
  (result) => { /* on result */ },
  (error) => { /* on error */ },
  (end) => { /* on end */ }
);
```

### Text-to-Speech (FAQ Reading)
```javascript
voiceAPI.speak('FAQ answer text', rate, pitch);
```

**Browser Support:**
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (partial support)
- ❌ IE (not supported)

## 🚀 Deployment

### Backend (Heroku/Render)
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Push to Heroku
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy build folder
```

## 🐛 Troubleshooting

### CORS Issues
- Check backend `.env` has correct `CORS_ORIGIN`
- Ensure frontend API URL matches backend

### Rate Limiting Not Working
- Check middleware is applied to route
- Verify user identifier is being captured correctly
- Check timestamps in browser console

### Voice Input Not Working
- Ensure HTTPS (required for Web Speech API in production)
- Check browser microphone permissions
- Test in Chrome/Edge first for best compatibility

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Vite Guide](https://vitejs.dev/guide/)

## 📄 License

MIT License - Feel free to use this project for learning and commercial purposes.

## 👤 Author

Built as a comprehensive full-stack MERN example application.

---

**Last Updated**: 2024
**Status**: Production Ready ✅
