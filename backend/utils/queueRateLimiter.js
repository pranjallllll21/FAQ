/**
 * QUEUE-BASED RATE LIMITING (Alternative DSA approach)
 * 
 * TIME COMPLEXITY: O(1) for enqueue/dequeue operations
 * SPACE COMPLEXITY: O(n) for storing timestamps
 * 
 * Uses a queue data structure (FIFO) to track request timestamps
 * More efficient for real-time removal of expired requests
 */

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    if (this.items.length === 0) return null;
    return this.items.shift();
  }

  front() {
    if (this.items.length === 0) return null;
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  print() {
    console.log(this.items.toString());
  }
}

class QueueBasedRateLimiter {
  constructor(maxRequests = 5, windowSizeMs = 5 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowSizeMs = windowSizeMs;
    this.requestQueues = new Map(); // Map of userIdentifier -> Queue of timestamps
  }

  /**
   * Check if user is allowed to make a request
   * Uses queue-based dequeue for O(1) removal of old requests
   */
  isAllowed(userIdentifier) {
    const now = Date.now();

    // Initialize user's request queue if not exists
    if (!this.requestQueues.has(userIdentifier)) {
      this.requestQueues.set(userIdentifier, new Queue());
    }

    const queue = this.requestQueues.get(userIdentifier);

    // Remove all timestamps outside the sliding window from the front
    while (!queue.isEmpty() && now - queue.front() >= this.windowSizeMs) {
      queue.dequeue();
    }

    console.log(
      `[Queue Rate Limit Check] User: ${userIdentifier}, Requests in window: ${queue.size()}/${this.maxRequests}`
    );

    // Check if user has exceeded the limit
    if (queue.size() >= this.maxRequests) {
      const oldestRequestTime = queue.front();
      const resetTime = oldestRequestTime + this.windowSizeMs;
      const timeUntilReset = resetTime - now;

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: resetTime,
        resetTimeSeconds: Math.ceil(timeUntilReset / 1000),
        message: `Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`,
      };
    }

    // Add current request timestamp
    queue.enqueue(now);

    return {
      allowed: true,
      remainingRequests: this.maxRequests - queue.size(),
      resetTime: null,
      resetTimeSeconds: null,
      message: 'Request allowed.',
    };
  }

  resetUser(userIdentifier) {
    this.requestQueues.delete(userIdentifier);
    console.log(`[Queue Rate Limit Reset] User: ${userIdentifier}`);
  }

  getUserStats(userIdentifier) {
    if (!this.requestQueues.has(userIdentifier)) {
      return {
        requests: 0,
        nextResetTime: null,
      };
    }

    const queue = this.requestQueues.get(userIdentifier);
    const now = Date.now();

    // Clean old requests
    while (!queue.isEmpty() && now - queue.front() >= this.windowSizeMs) {
      queue.dequeue();
    }

    return {
      requests: queue.size(),
      nextResetTime: !queue.isEmpty() ? queue.front() + this.windowSizeMs : null,
    };
  }
}

export default QueueBasedRateLimiter;
