# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-04-21T10:30:00.000Z",
  "message": "Smart FAQ Backend is running"
}
```

---

## FAQs Endpoints

### Get All FAQs
```http
GET /api/faqs
```

**Query Parameters:**
- `category`: Filter by category (General, Technical, Billing, Support, Features)
- `tags`: Filter by tags (comma-separated)
- `search`: Search keyword
- `sortBy`: Sort method (recent, likes, views, popular)

**Example:**
```
GET /api/faqs?category=Technical&sortBy=likes&search=React
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "question": "What is React?",
      "answer": "React is a JavaScript library...",
      "category": "Technical",
      "tags": ["React", "Frontend"],
      "likes": 45,
      "dislikes": 2,
      "views": 1234,
      "createdAt": "2024-04-20T10:30:00.000Z"
    }
  ]
}
```

---

### Get Single FAQ
```http
GET /api/faqs/:id
```

**Parameters:**
- `id`: FAQ MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": { /* FAQ object */ }
}
```

---

### Create FAQ (Admin)
```http
POST /api/faqs
Content-Type: application/json

{
  "question": "How do I update React?",
  "answer": "Use npm update react...",
  "category": "Technical",
  "tags": ["React", "Update"]
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "FAQ created successfully",
  "data": { /* Created FAQ object */ }
}
```

---

### Update FAQ (Admin)
```http
PUT /api/faqs/:id
Content-Type: application/json

{
  "question": "Updated question?",
  "answer": "Updated answer...",
  "category": "Support",
  "tags": ["updated"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ updated successfully",
  "data": { /* Updated FAQ object */ }
}
```

---

### Delete FAQ (Admin)
```http
DELETE /api/faqs/:id
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

---

## Questions Endpoints

### Submit Question (With Rate Limiting)
```http
POST /api/questions/ask
Content-Type: application/json

{
  "question": "What is GraphQL?",
  "email": "user@example.com",
  "category": "Technical"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Question submitted successfully!",
  "data": {
    "questionId": "507f1f77bcf86cd799439012",
    "question": "What is GraphQL?",
    "suggestedFAQs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "question": "What is REST API?",
        "category": "Technical"
      }
    ],
    "rateLimitInfo": {
      "remainingRequests": 2,
      "resetTime": 1713607600000
    }
  }
}
```

**Response (Rate Limit Exceeded - 429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Try again in 145 seconds.",
  "resetTimeSeconds": 145,
  "retryAfter": 145
}
```

---

### Get All Questions (Admin)
```http
GET /api/questions
```

**Query Parameters:**
- `status`: pending, reviewed, answered, archived
- `category`: Filter by category

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "question": "What is GraphQL?",
      "email": "user@example.com",
      "category": "Technical",
      "status": "pending",
      "relatedFAQId": null,
      "createdAt": "2024-04-21T10:30:00.000Z"
    }
  ]
}
```

---

### Update Question Status (Admin)
```http
PUT /api/questions/:id
Content-Type: application/json

{
  "status": "answered",
  "relatedFAQId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": { /* Updated question object */ }
}
```

---

### Delete Question
```http
DELETE /api/questions/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

## Reactions Endpoints

### Like FAQ
```http
POST /api/reactions/like/:faqId
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ liked successfully",
  "data": {
    "likes": 46,
    "dislikes": 2,
    "userLiked": true
  }
}
```

---

### Dislike FAQ
```http
POST /api/reactions/dislike/:faqId
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ disliked",
  "data": {
    "likes": 45,
    "dislikes": 3,
    "userDisliked": true
  }
}
```

---

## Rate Limiting Headers

All API responses include rate limit information in headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1713607600000
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Question must be at least 5 characters long"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "FAQ not found"
}
```

### 429 Too Many Requests (Rate Limited)
```json
{
  "success": false,
  "message": "Rate limit exceeded. Try again in 145 seconds.",
  "resetTimeSeconds": 145,
  "retryAfter": 145
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching FAQs",
  "error": "Error details..."
}
```

---

## Testing with cURL

### Get all FAQs
```bash
curl http://localhost:5000/api/faqs
```

### Get FAQs with filters
```bash
curl "http://localhost:5000/api/faqs?category=Technical&search=React"
```

### Submit a question
```bash
curl -X POST http://localhost:5000/api/questions/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is MongoDB?",
    "email": "user@example.com",
    "category": "Technical"
  }'
```

### Like an FAQ
```bash
curl -X POST http://localhost:5000/api/reactions/like/507f1f77bcf86cd799439011
```

---

## Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "Smart FAQ API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All FAQs",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/faqs",
          "host": ["{{base_url}}"],
          "path": ["api", "faqs"]
        }
      }
    },
    {
      "name": "Ask Question",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"question\": \"Your question?\", \"email\": \"user@example.com\", \"category\": \"General\"}"
        },
        "url": {
          "raw": "{{base_url}}/api/questions/ask",
          "host": ["{{base_url}}"],
          "path": ["api", "questions", "ask"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000",
      "type": "string"
    }
  ]
}
```

---

## Rate Limiting Details

- **Limit**: 5 questions per 5 minutes
- **Per**: User IP address
- **Strategy**: Sliding Window Algorithm
- **Response**: 429 Too Many Requests
- **Headers**: X-RateLimit-* included in response

---

**Last Updated**: 2024
