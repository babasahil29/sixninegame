/**
 * Rate limiting middleware
 */

class RateLimiter {
  constructor() {
    this.requests = new Map(); // Store request counts per IP
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Create rate limiter middleware
   * @param {Object} options - Rate limiting options
   * @returns {Function} Express middleware
   */
  createLimiter(options = {}) {
    const {
      windowMs = 60000, // 1 minute
      maxRequests = 100, // 100 requests per window
      message = 'Too many requests, please try again later',
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;

    return (req, res, next) => {
      const key = this.getKey(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get or create request log for this key
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const requestLog = this.requests.get(key);

      // Remove old requests outside the window
      const validRequests = requestLog.filter(timestamp => timestamp > windowStart);
      this.requests.set(key, validRequests);

      // Check if limit exceeded
      if (validRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
        });
      }

      // Add current request
      validRequests.push(now);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - validRequests.length),
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      });

      // Continue to next middleware
      const originalSend = res.send;
      res.send = function(body) {
        const statusCode = res.statusCode;
        
        // Remove request from log if configured to skip successful/failed requests
        if ((skipSuccessfulRequests && statusCode < 400) ||
            (skipFailedRequests && statusCode >= 400)) {
          const currentLog = this.requests.get(key) || [];
          const index = currentLog.lastIndexOf(now);
          if (index > -1) {
            currentLog.splice(index, 1);
          }
        }
        
        return originalSend.call(this, body);
      }.bind(this);

      next();
    };
  }

  /**
   * Get rate limiting key (IP address by default)
   * @param {Object} req - Express request object
   * @returns {string} Rate limiting key
   */
  getKey(req) {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  /**
   * Cleanup old request logs
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }

    console.log(`Rate limiter cleanup: ${this.requests.size} active IPs`);
  }

  /**
   * Get current rate limit status for a key
   * @param {string} key - Rate limiting key
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} Rate limit status
   */
  getStatus(key, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    return {
      key,
      requestCount: validRequests.length,
      windowStart: new Date(windowStart).toISOString(),
      windowEnd: new Date(now).toISOString(),
      oldestRequest: validRequests.length > 0 ? new Date(validRequests[0]).toISOString() : null,
      newestRequest: validRequests.length > 0 ? new Date(validRequests[validRequests.length - 1]).toISOString() : null
    };
  }

  /**
   * Reset rate limit for a key
   * @param {string} key - Rate limiting key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Get all active rate limit keys
   * @returns {string[]} Array of active keys
   */
  getActiveKeys() {
    return Array.from(this.requests.keys());
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

// Predefined rate limiters for different endpoints
const limiters = {
  // General API rate limiter
  general: rateLimiter.createLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests, please try again later'
  }),

  // Strict rate limiter for sensitive operations
  strict: rateLimiter.createLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    message: 'Too many requests for this operation, please try again later'
  }),

  // Game actions rate limiter
  gameActions: rateLimiter.createLimiter({
    windowMs: 10000, // 10 seconds
    maxRequests: 10, // 10 game actions per 10 seconds
    message: 'Too many game actions, please slow down'
  }),

  // Wallet operations rate limiter
  walletOperations: rateLimiter.createLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 wallet operations per minute
    message: 'Too many wallet operations, please try again later'
  }),

  // Crypto price requests rate limiter
  cryptoPrices: rateLimiter.createLimiter({
    windowMs: 10000, // 10 seconds
    maxRequests: 50, // 50 price requests per 10 seconds
    message: 'Too many price requests, please try again later'
  })
};

module.exports = {
  RateLimiter,
  rateLimiter,
  limiters
};

