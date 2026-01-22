/**
 * Rate Limiting Utility
 * 
 * Implements rate limiting for API routes to prevent abuse
 * Uses in-memory store for simplicity (can be replaced with Redis in production)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  max: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Custom identifier (defaults to IP address)
   */
  keyGenerator?: (request: Request) => string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Rate limiter function
 * @param identifier - Unique identifier (e.g., IP address, user ID, API key)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Initialize or get existing rate limit data
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };

    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: new Date(rateLimitStore[key].resetTime),
    };
  }

  // Increment counter
  rateLimitStore[key].count += 1;

  const remaining = Math.max(0, config.max - rateLimitStore[key].count);
  const success = rateLimitStore[key].count <= config.max;

  return {
    success,
    limit: config.max,
    remaining,
    reset: new Date(rateLimitStore[key].resetTime),
  };
}

/**
 * Default rate limit configurations for different tiers
 */
export const rateLimitConfigs = {
  // Free tier: 100 requests per hour
  free: {
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // BYOK tier: 500 requests per hour
  byok: {
    max: 500,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Admin: 1000 requests per hour
  admin: {
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Authentication endpoints: 10 requests per 15 minutes
  auth: {
    max: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // General API: 300 requests per hour
  api: {
    max: 300,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
  };
}
