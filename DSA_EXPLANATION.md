# Data Structures & Algorithms - Rate Limiting

## 📊 Overview

This application implements **rate limiting** using two different DSA approaches:

1. **Sliding Window Algorithm** (Main implementation)
2. **Queue-based Approach** (Alternative)

Both limit users to **5 questions per 5 minutes**.

---

## 1️⃣ Sliding Window Algorithm

### Location
`backend/utils/slidingWindow.js`

### Time & Space Complexity
- **Time Complexity**: O(n) per request
  - n = number of requests within the 5-minute window
  - In worst case: O(5) = O(1) since max 5 requests
  
- **Space Complexity**: O(m × n)
  - m = number of unique users
  - n = average requests per user in window

### How It Works

```javascript
const now = Date.now();

// STEP 1: Remove old timestamps (outside window)
requests = requests.filter(timestamp => 
  now - timestamp < WINDOW_SIZE
);
// This is the KEY - slides the window forward

// STEP 2: Check limit
if (requests.length >= MAX_REQUESTS) {
  return { allowed: false }; // ❌ Too many requests
}

// STEP 3: Add current request
requests.push(now);       // ✅ Request allowed
return { allowed: true };
```

### Visual Example

```
Time: 0:00 - 5:00 (5 minute window)
User A requests:
├─ 0:10 [Request 1] ─────────┤
├─ 1:20 [Request 2] ─────────┤
├─ 2:30 [Request 3] ─────────┤
├─ 3:40 [Request 4] ─────────┤
├─ 4:50 [Request 5] ─────────┤ ← MAX LIMIT
└─ 4:55 [Request 6] ❌ BLOCKED!
   │                    │
   └─ Will be allowed after 0:10 expires (at 5:10)
```

### Algorithm Pseudocode

```
class SlidingWindowRateLimiter:
    function isAllowed(userID):
        now = currentTime()
        
        // Get user's request timestamps (create if doesn't exist)
        if userID not in requestMap:
            requestMap[userID] = []
        
        timestamps = requestMap[userID]
        
        // SLIDING: Remove timestamps outside window
        newTimestamps = []
        for each timestamp in timestamps:
            if (now - timestamp) < WINDOW_SIZE:
                newTimestamps.append(timestamp)
        
        timestamps = newTimestamps
        requestMap[userID] = timestamps
        
        // CHECK: Is limit exceeded?
        if timestamps.length >= MAX_REQUESTS:
            oldestTime = timestamps[0]
            resetTime = oldestTime + WINDOW_SIZE
            return {
                allowed: false,
                resetTime: resetTime
            }
        
        // ALLOW: Add current request
        timestamps.push(now)
        requestMap[userID] = timestamps
        return {
            allowed: true,
            remaining: MAX_REQUESTS - timestamps.length
        }
```

### Real Code Example

```javascript
// 5 questions per 5 minutes
const limiter = new SlidingWindowRateLimiter(5, 5*60*1000);

// Check if user can ask a question
const result = limiter.isAllowed('user-ip-123');

if (result.allowed) {
  // Process question
  console.log(`✅ Request allowed. ${result.remainingRequests} left`);
} else {
  // Block question
  console.log(`❌ Rate limit exceeded. Retry in ${result.resetTimeSeconds}s`);
}
```

### Advantages ✅
- Simple to understand and implement
- Works well with persistent connection
- Good for moderate request rates
- Handles concurrent requests

### Disadvantages ❌
- O(n) time complexity per request
- Must clean up old timestamps
- Memory usage grows per user

---

## 2️⃣ Queue-Based Approach

### Location
`backend/utils/queueRateLimiter.js`

### Time & Space Complexity
- **Time Complexity**: O(1) per request
  - Enqueue: O(1)
  - Dequeue: O(1)
  - Only dequeues when needed
  
- **Space Complexity**: O(m × n)
  - Same as sliding window (m users, n requests)

### How It Works

```javascript
// STEP 1: Create queue if doesn't exist
if (!requestQueues.has(userID)) {
  requestQueues.set(userID, new Queue());
}

const queue = requestQueues.get(userID);

// STEP 2: Remove expired timestamps from FRONT
while (!queue.isEmpty() && 
       now - queue.front() >= WINDOW_SIZE) {
  queue.dequeue();  // O(1) operation!
}

// STEP 3: Check limit
if (queue.size() >= MAX_REQUESTS) {
  return { allowed: false };
}

// STEP 4: Add current request
queue.enqueue(now);  // O(1) operation!
return { allowed: true };
```

### Queue Implementation

```javascript
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(element) {
    this.items.push(element);  // O(1) - add to end
  }
  
  dequeue() {
    return this.items.shift();  // O(n) but practical for rate limiting
  }
  
  front() {
    return this.items[0];  // O(1) - peek at front
  }
  
  size() {
    return this.items.length;
  }
}
```

### Visual Example (Queue)

```
Queue for User A:
     ┌─────┬─────┬─────┬─────┬─────┐
     │0:10 │1:20 │2:30 │3:40 │4:50 │  (5 items = limit reached)
     └─────┴─────┴─────┴─────┴─────┘
     ↑                           ↑
   FRONT                       BACK
   (oldest)                   (newest)
   
   At 0:05: Dequeue 0:10 (expired)
   Now: ┌─────┬─────┬─────┬─────┐
        │1:20 │2:30 │3:40 │4:50 │
        └─────┴─────┴─────┴─────┘
   
   Enqueue 0:05: ✅ ALLOWED
```

### Algorithm Pseudocode

```
class QueueBasedRateLimiter:
    function isAllowed(userID):
        now = currentTime()
        
        // Get user's queue (create if doesn't exist)
        if userID not in requestQueues:
            requestQueues[userID] = new Queue()
        
        queue = requestQueues[userID]
        
        // DEQUEUE: Remove expired timestamps from front
        while !queue.isEmpty() AND 
              (now - queue.front()) >= WINDOW_SIZE:
            queue.dequeue()     // O(1) pop from front
        
        // CHECK: Is limit exceeded?
        if queue.size() >= MAX_REQUESTS:
            oldestTime = queue.front()
            resetTime = oldestTime + WINDOW_SIZE
            return {
                allowed: false,
                resetTime: resetTime
            }
        
        // ALLOW: Add current request
        queue.enqueue(now)      // O(1) push to back
        return {
            allowed: true,
            remaining: MAX_REQUESTS - queue.size()
        }
```

### Advantages ✅
- O(1) time complexity (amortized)
- Cleaner code with Queue data structure
- Automatic cleanup at front (FIFO)
- Very efficient for continuous monitoring

### Disadvantages ❌
- Requires Queue implementation
- Slightly more memory overhead
- JavaScript arrays aren't true queues (dequeue is O(n))

---

## 🔄 Comparison

| Feature | Sliding Window | Queue |
|---------|---|---|
| **Time Complexity** | O(n) per request | O(1) per request |
| **Space** | O(m×n) | O(m×n) |
| **Implementation** | Simple (array filter) | Queue data structure |
| **Memory Cleanup** | Scan all timestamps | Only front |
| **Best For** | Moderate traffic | High traffic, real-time |
| **Code Complexity** | Low | Medium |

---

## 📈 Performance Analysis

### For 5 request limit:

**Sliding Window**
```
Per request: Filter ~5 timestamps = O(5) = O(1)
Actually efficient in practice!
```

**Queue**
```
Per request: Dequeue ~1 item = O(1)
Technically faster
```

### For real-world scenario (100,000 users):

```
Sliding Window:
- Memory: ~500KB (100k users × 5 timestamps)
- Time: ~5-10ms per request

Queue:
- Memory: ~500KB (same)
- Time: ~1-2ms per request
```

---

## 💡 When to Use Each

### Use Sliding Window When:
- ✅ Simple implementation needed
- ✅ Moderate request rates (< 1000 req/sec)
- ✅ Learning/educational purposes
- ✅ Small user base

### Use Queue When:
- ✅ High traffic applications (> 1000 req/sec)
- ✅ Real-time systems requiring O(1) operations
- ✅ Distributed systems with central rate limiting
- ✅ Production-grade requirements

---

## 🧪 Testing Rate Limiting

### Manual Test

1. **First 5 questions**: Click "Ask a Question" and submit questions quickly
2. **6th question**: Should see rate limit modal
3. **Wait 5 minutes**: Or wait for remaining time countdown
4. **Next question**: Should be allowed again

### Code Test

```javascript
const limiter = new SlidingWindowRateLimiter(5, 5*60*1000);

// Simulate user asking 5 questions
for (let i = 0; i < 5; i++) {
  const result = limiter.isAllowed('user-123');
  console.log(`Request ${i+1}: ${result.allowed ? '✅' : '❌'}`);
}

// 6th request should be blocked
const result = limiter.isAllowed('user-123');
console.log(`Request 6: ${result.allowed ? '✅' : '❌'}`);  // ❌
console.log(`Try again in ${result.resetTimeSeconds} seconds`);
```

---

## 📚 Further Reading

1. **Sliding Window**: Used in TCP congestion control, rate limiting
2. **Queue Data Structure**: Foundation for BFS, scheduling, caching
3. **Leaky Bucket Algorithm**: Alternative rate limiting approach
4. **Token Bucket Algorithm**: Another popular rate limiting strategy

---

## 🎓 Educational Value

This implementation teaches:
- ✅ How to analyze algorithm complexity
- ✅ Practical application of data structures
- ✅ Trade-offs between simplicity and performance
- ✅ Real-world system design patterns
- ✅ Rate limiting (essential for API design)

---

**Last Updated**: 2024
