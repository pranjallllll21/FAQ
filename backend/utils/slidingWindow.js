/**
 * SLIDING WINDOW ALGORITHM FOR RATE LIMITING
 * 
 * TIME COMPLEXITY: O(n) where n = number of requests in the window
 * SPACE COMPLEXITY: O(n) for storing timestamps
 * 
 * The sliding window algorithm maintains a rolling window of time
 * and removes timestamps that fall outside the window automatically.
 * This allows us to track user requests within a specific time frame.
 * 
 * Alternative DSA Approach: Queue-based rate limiting
 * - Use a queue to store timestamps
 * - Remove from front when older than window
 * - Check if new request can be added
 */

class SlidingWindowRateLimiter {
  constructor(maxRequests = 5, windowSizeMs = 5 * 60 * 1000) {
    this.maxRequests = maxRequests; // Max 5 questions
    this.windowSizeMs = windowSizeMs; // 5 minutes in milliseconds
    this.requestMap = new Map(); // Map of userIdentifier -> array of timestamps
  }

  /**
   * Check if user is allowed to make a request
   * Returns: { allowed: boolean, remainingRequests: number, resetTime: timestamp }
   */
  isAllowed(userIdentifier) {
    const now = Date.now();
    
    // Initialize user's request array if not exists
    if (!this.requestMap.has(userIdentifier)) {
      this.requestMap.set(userIdentifier, []);
    }

    let requests = this.requestMap.get(userIdentifier);

    // Remove timestamps outside the sliding window
    // This is the KEY part of sliding window - clean old requests
    requests = requests.filter(timestamp => now - timestamp < this.windowSizeMs);

    console.log(
      `[Rate Limit Check] User: ${userIdentifier}, Requests in window: ${requests.length}/${this.maxRequests}`
    );

    // Check if user has exceeded the limit
    if (requests.length >= this.maxRequests) {
      // Calculate when the oldest request expires
      const oldestRequestTime = requests[0];
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
    requests.push(now);
    this.requestMap.set(userIdentifier, requests);

    return {
      allowed: true,
      remainingRequests: this.maxRequests - requests.length,
      resetTime: null,
      resetTimeSeconds: null,
      message: 'Request allowed.',
    };
  }

  /**
   * Reset rate limit for a user (admin operation)
   */
  resetUser(userIdentifier) {
    this.requestMap.delete(userIdentifier);
    console.log(`[Rate Limit Reset] User: ${userIdentifier}`);
  }

  /**
   * Get stats for a user
   */
  getUserStats(userIdentifier) {
    const now = Date.now();
    if (!this.requestMap.has(userIdentifier)) {
      return {
        requests: 0,
        nextResetTime: null,
      };
    }

    let requests = this.requestMap.get(userIdentifier);
    requests = requests.filter(timestamp => now - timestamp < this.windowSizeMs);

    return {
      requests: requests.length,
      nextResetTime: requests.length > 0 ? requests[0] + this.windowSizeMs : null,
    };
  }
}

export default SlidingWindowRateLimiter;
