/**
 * Rate Limiting Middleware
 *
 * Implements token bucket algorithm for rate limiting AI API requests.
 * Features:
 * - Per-user rate limiting
 * - Configurable limits per endpoint
 * - Automatic cleanup of old entries
 * - Headers to inform clients about rate limits
 */

// Rate limit configuration
const RATE_LIMITS = {
  // Global limits (requests per minute)
  global: {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  },

  // Per-user limits (requests per minute)
  perUser: {
    maxRequests: 20,
    windowMs: 60000 // 1 minute
  },

  // Per-endpoint limits (requests per minute)
  endpoints: {
    '/api/ai/summarize': { maxRequests: 10, windowMs: 60000 },
    '/api/ai/generate-mcq': { maxRequests: 10, windowMs: 60000 },
    '/api/ai/generate-flashcards': { maxRequests: 10, windowMs: 60000 },
    '/api/ai/generate-concept-map': { maxRequests: 10, windowMs: 60000 },
    '/api/ai/generate-questions': { maxRequests: 10, windowMs: 60000 },
    '/api/ai/match-internships': { maxRequests: 20, windowMs: 60000 }
  }
};

// Store for tracking requests
const requestStore = {
  global: new Map(),
  users: new Map(),
  endpoints: new Map()
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();

  // Clean global store
  for (const [key, data] of requestStore.global.entries()) {
    if (now - data.resetTime > RATE_LIMITS.global.windowMs) {
      requestStore.global.delete(key);
    }
  }

  // Clean user store
  for (const [key, data] of requestStore.users.entries()) {
    if (now - data.resetTime > RATE_LIMITS.perUser.windowMs) {
      requestStore.users.delete(key);
    }
  }

  // Clean endpoint store
  for (const [key, data] of requestStore.endpoints.entries()) {
    const endpoint = key.split(':')[0];
    const limit = RATE_LIMITS.endpoints[endpoint];
    if (limit && now - data.resetTime > limit.windowMs) {
      requestStore.endpoints.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

/**
 * Get or create rate limit entry
 */
function getRateLimitEntry(store, key, maxRequests, windowMs) {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now - entry.resetTime > windowMs) {
    entry = {
      count: 0,
      resetTime: now,
      maxRequests,
      windowMs
    };
    store.set(key, entry);
  }

  return entry;
}

/**
 * Check if rate limit is exceeded
 */
function checkRateLimit(store, key, maxRequests, windowMs) {
  const entry = getRateLimitEntry(store, key, maxRequests, windowMs);
  const now = Date.now();

  if (now - entry.resetTime > windowMs) {
    // Reset window
    entry.count = 0;
    entry.resetTime = now;
  }

  entry.count++;

  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime + windowMs,
    limit: maxRequests
  };
}

/**
 * Rate limiting middleware
 */
function rateLimiter(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.body?.createdBy || req.headers['x-user-id'] || ip;
  const endpoint = req.path;

  // Check global rate limit
  const globalLimit = checkRateLimit(
    requestStore.global,
    'global',
    RATE_LIMITS.global.maxRequests,
    RATE_LIMITS.global.windowMs
  );

  if (!globalLimit.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Global rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((globalLimit.resetTime - now) / 1000),
      limit: globalLimit.limit,
      remaining: 0
    });
  }

  // Check per-user rate limit
  const userLimit = checkRateLimit(
    requestStore.users,
    userId,
    RATE_LIMITS.perUser.maxRequests,
    RATE_LIMITS.perUser.windowMs
  );

  if (!userLimit.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'User rate limit exceeded. Please slow down your requests.',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      limit: userLimit.limit,
      remaining: 0
    });
  }

  // Check endpoint-specific rate limit
  const endpointConfig = RATE_LIMITS.endpoints[endpoint];
  if (endpointConfig) {
    const endpointLimit = checkRateLimit(
      requestStore.endpoints,
      `${endpoint}:${userId}`,
      endpointConfig.maxRequests,
      endpointConfig.windowMs
    );

    if (!endpointLimit.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${endpoint}. Please try again later.`,
        retryAfter: Math.ceil((endpointLimit.resetTime - now) / 1000),
        limit: endpointLimit.limit,
        remaining: 0
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', endpointLimit.limit);
    res.setHeader('X-RateLimit-Remaining', endpointLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(endpointLimit.resetTime / 1000));
  }

  // Add general rate limit headers
  res.setHeader('X-RateLimit-Global-Limit', globalLimit.limit);
  res.setHeader('X-RateLimit-Global-Remaining', globalLimit.remaining);
  res.setHeader('X-RateLimit-User-Limit', userLimit.limit);
  res.setHeader('X-RateLimit-User-Remaining', userLimit.remaining);

  next();
}

/**
 * Get rate limit statistics (for admin/monitoring)
 */
function getRateLimitStats() {
  return {
    global: {
      config: RATE_LIMITS.global,
      activeKeys: requestStore.global.size
    },
    users: {
      config: RATE_LIMITS.perUser,
      activeUsers: requestStore.users.size,
      topUsers: Array.from(requestStore.users.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([userId, data]) => ({
          userId,
          requests: data.count,
          remaining: data.maxRequests - data.count
        }))
    },
    endpoints: {
      config: RATE_LIMITS.endpoints,
      activeEndpoints: requestStore.endpoints.size
    }
  };
}

/**
 * Reset rate limits (admin function)
 */
function resetRateLimits(type = 'all') {
  if (type === 'all' || type === 'global') {
    requestStore.global.clear();
  }
  if (type === 'all' || type === 'users') {
    requestStore.users.clear();
  }
  if (type === 'all' || type === 'endpoints') {
    requestStore.endpoints.clear();
  }
}

module.exports = {
  rateLimiter,
  getRateLimitStats,
  resetRateLimits,
  RATE_LIMITS
};
