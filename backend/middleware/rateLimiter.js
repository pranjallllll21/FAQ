import SlidingWindowRateLimiter from '../utils/slidingWindow.js';

// Initialize rate limiter (5 questions per 5 minutes)
const rateLimiter = new SlidingWindowRateLimiter(5, 5 * 60 * 1000);

/**
 * Rate limiting middleware for question submissions
 * Uses Sliding Window DSA to track user requests
 */
const rateLimitMiddleware = (req, res, next) => {
  // Get user identifier (IP address or session ID)
  const userIdentifier = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check if request is allowed
  const result = rateLimiter.isAllowed(userIdentifier);

  // Add rate limit info to response headers
  res.set({
    'X-RateLimit-Remaining': result.remainingRequests || 0,
    'X-RateLimit-Reset': result.resetTime || 'N/A',
    'X-RateLimit-Limit': 5,
  });

  // If not allowed, return error
  if (!result.allowed) {
    return res.status(429).json({
      success: false,
      message: result.message,
      resetTimeSeconds: result.resetTimeSeconds,
      retryAfter: result.resetTimeSeconds,
    });
  }

  // Store user identifier for use in route handlers
  req.userIdentifier = userIdentifier;
  req.rateLimitInfo = result;

  next();
};

/**
 * Export the rate limiter instance for manual checks
 */
const getRateLimiter = () => rateLimiter;

export {
  rateLimitMiddleware,
  getRateLimiter,
};
