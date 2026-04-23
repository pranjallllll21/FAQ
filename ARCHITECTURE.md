# Architecture & System Design

This document explains the architecture of the Smart FAQ Accordion application.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMART FAQ ACCORDION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐  │
│  │   FRONTEND (React + Vite)     │      │   BACKEND (Express)          │  │
│  ├──────────────────────────────┤      ├──────────────────────────────┤  │
│  │                              │      │                              │  │
│  │ ┌──────────────────────────┐│      │ ┌────────────────────────────┐│  │
│  │ │ Header (Theme Toggle)    ││      │ │ Server (server.js)         ││  │
│  │ ├──────────────────────────┤│      │ ├────────────────────────────┤│  │
│  │ │ SearchBar (Search/Filter)││      │ │ Middleware (CORS, JSON)    ││  │
│  │ ├──────────────────────────┤│      │ ├────────────────────────────┤│  │
│  │ │ FAQAccordion            ││      │ │ RATE LIMITER               ││  │
│  │ │ (Expandable FAQs)       ││      │ │ (Sliding Window / Queue)   ││  │
│  │ ├──────────────────────────┤│      │ ├────────────────────────────┤│  │
│  │ │ VoiceAgent              ││      │ │ API Routes:                ││  │
│  │ │ (Web Speech API)        ││      │ │  - GET /faqs              ││  │
│  │ ├──────────────────────────┤│      │ │  - POST /questions/ask    ││  │
│  │ │ AskQuestionModal        ││      │ │  - POST /reactions/like   ││  │
│  │ │ (Rate Limit Display)    ││      │ ├────────────────────────────┤│  │
│  │ └──────────────────────────┘│      │ │ Database Models:           ││  │
│  │                              │      │ │  - FAQ Schema             ││  │
│  │ ┌──────────────────────────┐│      │ │  - UserQuestion Schema    ││  │
│  │ │ Utils/Helpers:           ││      │ └────────────────────────────┘│  │
│  │ │ - api.js (API calls)     ││      │                              │  │
│  │ │ - theme.js (Dark mode)   ││      │ Utilities:                     │  │
│  │ │ - voice.js (Speech API)  ││      │ - slidingWindow.js             │  │
│  │ │ - helpers.js (13 utils)  ││      │ - queueRateLimiter.js          │  │
│  │ └──────────────────────────┘│      │ - middleware/rateLimiter.js    │  │
│  │                              │      │                              │  │
│  └──────────────────────────────┘      └──────────────────────────────┘  │
│           │                                        │                      │
│           └───────────────────┬────────────────────┘                      │
│                               │                                           │
│                      HTTP/CORS Requests                                   │
│                      (localhost:5000)                                     │
│                               │                                           │
│  ┌────────────────────────────▼───────────────────────┐                  │
│  │        MONGODB DATABASE                             │                  │
│  ├──────────────────────────────────────────────────────┤                 │
│  │                                                      │                 │
│  │ Collections:                                         │                 │
│  │  • faqs (12 documents with indexes)                 │                 │
│  │  • userquestions (submitted questions)              │                 │
│  │                                                      │                 │
│  │ Indexes:                                             │                 │
│  │  • Full-text search on question, answer, tags       │                 │
│  │  • Category index                                    │                 │
│  │  • Tags index                                        │                 │
│  │  • CreatedAt index                                   │                 │
│  │                                                      │                 │
│  └──────────────────────────────────────────────────────┘                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Scenario 1: Loading FAQs
```
User Opens App
    │
    ▼
React App Loads (App.jsx)
    │
    ├─ Initialize Theme
    │   └─ Check localStorage
    │       └─ Set light/dark mode
    │
    ├─ Fetch FAQs
    │   └─ API Call: GET /api/faqs
    │       │
    │       ▼
    │   Express Server
    │       │
    │       ├─ CORS Check ✓
    │       ├─ Route Handler: faqs.js
    │       │
    │       ▼
    │   MongoDB Query
    │       │
    │       ├─ Find all active FAQs
    │       ├─ Sort by creation date
    │       └─ Return 12 documents
    │
    │       ▼
    │   Response: 200 OK
    │       {
    │         success: true,
    │         data: [FAQ objects]
    │       }
    │
    ▼
Display in Accordion
    │
    ├─ RenderAccordionItems
    │   └─ Each FAQ: question, answer, tags, likes, dislikes
    │
    └─ Show Count: "Showing 12 of 12 FAQs"
```

### Scenario 2: Rate Limited Question
```
User Clicks "Ask Question"
    │
    ▼
AskQuestionModal Opens
    │
    ├─ Form Fields:
    │   ├─ Question textarea
    │   ├─ Email input
    │   └─ Category dropdown
    │
User Submits Question
    │
    ▼
Frontend Validation
    │
    ├─ Question length >= 5? ✓
    ├─ Email format valid? ✓
    └─ Category selected? ✓
    │
    ▼
API Call: POST /api/questions/ask
    │
    ├─ Request Body:
    │   {
    │     "question": "What is React?",
    │     "email": "user@example.com",
    │     "category": "Technical"
    │   }
    │
    ▼
Express Server Receives Request
    │
    ├─ CORS Check ✓
    ├─ Body Parser ✓
    │
    ▼
Rate Limiter Middleware (rateLimitMiddleware)
    │
    ├─ Get User IP: "192.168.1.100"
    ├─ Call: rateLimiter.isAllowed(userIP)
    │
    ▼
Sliding Window Algorithm
    │
    ├─ Get timestamps for this IP
    ├─ Remove old timestamps (> 5 min)
    ├─ Check: count < 5?
    │   ├─ YES: Add timestamp, allow request
    │   └─ NO: Return 429 (Too Many Requests)
    │
    ▼
    
    ┌─── If ALLOWED (Success) ───┐
    │                            │
    ▼                            ▼
Save Question              Return 429 Error
    │                            │
    ├─ Create UserQuestion       ├─ Response: 429
    │   {                        ├─ Message: Rate limit exceeded
    │     question,              ├─ resetTimeSeconds: 145
    │     email,                 └─ retryAfter: 145
    │     userIdentifier (IP),
    │     ipAddress,
    │     status: "pending"
    │   }
    │
    ├─ Search Similar FAQs       Frontend Receives Error
    │                            │
    ├─ Return 201 Created        ├─ Show Modal:
    │   {                        │   "Rate Limit Exceeded"
    │     success: true,         ├─ Show Countdown Timer
    │     data: {                │   "Try again in 145 seconds"
    │       questionId,          │
    │       suggestedFAQs,       └─ Disable Form
    │       rateLimitInfo: {
    │         remainingRequests: 4,
    │         resetTime: ...
    │       }
    │     }
    │   }
    │
    ▼
Frontend Receives Success
    │
    ├─ Show Success Message
    ├─ Display Suggested FAQs (if any)
    ├─ Show remaining requests: 4/5
    └─ Close modal after 2 seconds
```

### Scenario 3: Voice Input & Suggestions
```
User Clicks Microphone 🎤
    │
    ▼
VoiceAgent Component Activates
    │
    ├─ Browser Permission Check
    │   └─ User approves microphone access
    │
    ├─ Start Speech Recognition
    │   (Web Speech API)
    │
    ├─ Show Status: "Listening..."
    │
    ▼
User Speaks: "How do I install Node?"
    │
    ├─ Real-time Transcript Updates
    │   └─ Show interim results
    │
    ▼
Speech Recognition Ends
    │
    ├─ Final Transcript: "How do I install Node.js"
    ├─ Status: "Processing..."
    │
    ▼
Handle Transcript
    │
    ├─ Update Search Term
    ├─ Search FAQs locally
    │   └─ Query: "install Node"
    │
    ▼
Find Matching FAQs
    │
    ├─ Search in memory (browser)
    ├─ Find matches: 3 results
    │   ├─ "How do I install Node.js?"
    │   ├─ "What is Node.js?"
    │   └─ "Node.js setup guide"
    │
    ▼
Display Suggestions
    │
    ├─ Show "Suggested FAQs" panel
    ├─ List 3 matching questions
    │
    └─ User clicks one → Scroll to FAQ
```

---

## 🔗 Component Hierarchy

```
App (Main Component)
│
├─ Header
│   ├─ Title & Logo
│   ├─ Ask Question Button
│   └─ Theme Toggle (☀️/🌙)
│
├─ Main Content
│   │
│   ├─ Hero Section
│   │   └─ VoiceAgent
│   │       ├─ Microphone Button 🎤
│   │       ├─ Transcript Display
│   │       └─ Error Messages
│   │
│   ├─ SearchBar
│   │   ├─ Search Input
│   │   └─ Category Filter Dropdown
│   │
│   ├─ Suggestions Panel (conditional)
│   │   └─ List of Suggested FAQs
│   │
│   └─ FAQAccordion
│       └─ AccordionItem (repeating)
│           ├─ Question Header
│           │   ├─ Title
│           │   ├─ Tags
│           │   └─ Chevron Icon
│           │
│           ├─ Expandable Content
│           │   ├─ Answer Text
│           │   ├─ Category Badge
│           │   ├─ View Count
│           │   ├─ Like Button
│           │   └─ Dislike Button
│           │
│           └─ State Management
│               ├─ isOpen (boolean)
│               ├─ userReaction (null/like/dislike)
│               └─ Update functions
│
├─ AskQuestionModal (conditional)
│   ├─ Form Title
│   ├─ Question Textarea
│   ├─ Email Input
│   ├─ Category Select
│   ├─ Submit Button
│   └─ Error/Success Messages
│       └─ RateLimitModal (if rate limited)
│           ├─ Icon & Title
│           ├─ Countdown Timer ⏰
│           ├─ Reset Time Display
│           └─ Dismiss Button
│
└─ Footer
    └─ Credits & Info
```

---

## 📊 State Management Architecture

```
App Component State:

├─ faqs: [{...}, {...}]              // All FAQs from DB
├─ filteredFaqs: [{...}]             // After search/filter
├─ isLoading: boolean                // Loading state
├─ error: string | null              // Error messages
├─ searchTerm: string                // Current search
├─ selectedCategory: string          // Selected category
├─ isAskModalOpen: boolean           // Question modal visibility
├─ suggestedFAQs: [{...}]            // Suggested FAQs
└─ showSuggestions: boolean          // Show suggestions panel

AccordionItem State:
├─ isOpen: boolean                   // Item expanded?
└─ userReaction: null|'like'|'dislike'

VoiceAgent State:
├─ isListening: boolean              // Recording?
├─ transcript: string                // Final text
├─ interim: string                   // Real-time text
├─ error: string | null              // Error message
└─ status: string                    // idle/listening/processing/done

AskQuestionModal State:
├─ formData: {                       // Form fields
│   question: string
│   email: string
│   category: string
│ }
├─ isLoading: boolean                // Submitting?
├─ rateLimitError: object | null     // Rate limit info
├─ success: boolean                  // Submit successful?
└─ remainingRequests: number | null  // Questions left
```

---

## 🎯 Request/Response Flow

### Example: Get all FAQs with search

**Request:**
```
GET http://localhost:5000/api/faqs?search=React&category=Technical&sortBy=likes
```

**Backend Processing:**
```
Express Server
    ├─ Parse query params
    │   ├─ search: "React"
    │   ├─ category: "Technical"
    │   └─ sortBy: "likes"
    │
    ├─ Build MongoDB query
    │   ├─ $text: { $search: "React" }
    │   └─ category: "Technical"
    │
    ├─ Apply sorting
    │   └─ likes: -1 (descending)
    │
    ├─ Execute query
    │   └─ FAQ.find(query).sort(sortObj)
    │
    ├─ Increment views (for each FAQ)
    │   └─ $inc: { views: 1 }
    │
    └─ Return response
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "question": "What is React?",
      "answer": "React is a JavaScript library...",
      "category": "Technical",
      "tags": ["React", "Frontend"],
      "likes": 45,
      "dislikes": 2,
      "views": 1235,
      "createdAt": "2024-04-20T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "question": "How do I use React Hooks?",
      "answer": "React Hooks allow you to use state...",
      "category": "Technical",
      "tags": ["React", "Hooks"],
      "likes": 38,
      "dislikes": 1,
      "views": 856,
      "createdAt": "2024-04-19T15:45:00.000Z"
    }
  ]
}
```

---

## 🛡️ Rate Limiting Architecture

### Sliding Window Implementation

```
┌───────────────────────────────────────────────────┐
│ Rate Limiter (5 requests per 5 minutes)            │
├───────────────────────────────────────────────────┤
│                                                    │
│ Request Map:                                       │
│ {                                                  │
│   "192.168.1.100": [                              │
│     1713607800000,  // Request 1 (0:00)           │
│     1713607860000,  // Request 2 (1:00)           │
│     1713607920000,  // Request 3 (2:00)           │
│     1713607980000   // Request 4 (3:20)           │
│   ],                                               │
│   "192.168.1.101": [                              │
│     1713607840000   // Request 1 (0:40)           │
│   ]                                                │
│ }                                                  │
│                                                    │
│ Timeline (5 minute window): 0:00 ────────────── 5:00
│                                                    │
│ User A: ●(0:00) ●(1:00) ●(2:00) ●(3:20) [NEXT OK]│
│ User B: ●(0:40) [4 more allowed in window]        │
│                                                    │
│ Algorithm:                                         │
│ 1. Get timestamps for user                        │
│ 2. Remove timestamps > 5 min old                  │
│ 3. If remaining >= 5 → BLOCK (429)                │
│ 4. Else → ALLOW & add new timestamp               │
│                                                    │
└───────────────────────────────────────────────────┘
```

---

## 📈 Scaling Architecture

### Current Setup (Single Server)
```
Client
  │
  ├─ HTTP Request
  │
  ▼
Express Server (port 5000)
  │
  ├─ Rate Limiter (in-memory)
  ├─ Request Handler
  │
  ▼
MongoDB (local or Atlas)
```

### Scalable Setup (Multiple Servers)
```
Clients (Many)
  │
  ├─ HTTP/HTTPS Requests
  │
  ▼
Load Balancer (Nginx)
  │
  ├─ Round Robin Distribution
  │
  ├─ Express Server 1
  ├─ Express Server 2
  ├─ Express Server 3
  │
  ▼
Shared Resources
  │
  ├─ Redis (Rate Limiter Cache)
  ├─ MongoDB (Database)
  └─ CDN (Static Files)
```

---

## 🔐 Security Architecture

```
Request Flow:
    │
    ▼
CORS Middleware
    ├─ Check Origin
    └─ Validate Request
    │
    ▼
Rate Limiter Middleware
    ├─ Check User IP
    ├─ Check Request Count
    └─ Block if exceeded
    │
    ▼
Input Validation
    ├─ Check Question Length
    ├─ Validate Email Format
    └─ Sanitize Input
    │
    ▼
Route Handler
    ├─ Process Request
    └─ Database Query
    │
    ▼
Error Handler
    ├─ Catch Errors
    ├─ Log Issues
    └─ Send Safe Response
```

---

## 📦 Deployment Architecture

```
Development:
  Frontend (Vite)      Backend (Express)
  localhost:5173       localhost:5000
       │                    │
       └────────────────────┘
            localhost DB

Production:
  Vercel/Netlify       Heroku/Render         MongoDB Atlas
  (Frontend)           (Backend)             (Database)
       │                    │                     │
       └────────────────────┴─────────────────────┘
              HTTPS/CORS
```

---

**Architecture Document**
*Last Updated: 2024*
