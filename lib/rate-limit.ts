import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limit configurations from PRD
const RATE_LIMITS = {
  anonymous: {
    // 1 request per 5 seconds for anonymous users
    requests: 1,
    window: "5 s" as const,
  },
  authenticated: {
    // 1 request per 3 seconds for authenticated users
    requests: 1,
    window: "3 s" as const,
  },
  authenticatedHourly: {
    // 60 requests per hour for authenticated users
    requests: 60,
    window: "1 h" as const,
  },
};

// Create Redis client (returns null if not configured)
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Upstash Redis not configured - rate limiting disabled");
    return null;
  }

  return new Redis({ url, token });
}

// Rate limiters (lazily initialized)
let anonymousLimiter: Ratelimit | null = null;
let authenticatedLimiter: Ratelimit | null = null;
let hourlyLimiter: Ratelimit | null = null;

function getAnonymousLimiter(): Ratelimit | null {
  const redis = createRedisClient();
  if (!redis) return null;

  if (!anonymousLimiter) {
    anonymousLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.anonymous.requests,
        RATE_LIMITS.anonymous.window
      ),
      prefix: "ratelimit:anon",
    });
  }
  return anonymousLimiter;
}

function getAuthenticatedLimiter(): Ratelimit | null {
  const redis = createRedisClient();
  if (!redis) return null;

  if (!authenticatedLimiter) {
    authenticatedLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.authenticated.requests,
        RATE_LIMITS.authenticated.window
      ),
      prefix: "ratelimit:auth",
    });
  }
  return authenticatedLimiter;
}

function getHourlyLimiter(): Ratelimit | null {
  const redis = createRedisClient();
  if (!redis) return null;

  if (!hourlyLimiter) {
    hourlyLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.authenticatedHourly.requests,
        RATE_LIMITS.authenticatedHourly.window
      ),
      prefix: "ratelimit:hourly",
    });
  }
  return hourlyLimiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp when limit resets
  retryAfter?: number; // seconds until retry allowed
}

// Check rate limit for a request
export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): Promise<RateLimitResult> {
  // If Redis not configured, allow all requests
  const limiter = isAuthenticated ? getAuthenticatedLimiter() : getAnonymousLimiter();

  if (!limiter) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 1000,
    };
  }

  const result = await limiter.limit(identifier);

  // For authenticated users, also check hourly limit
  if (isAuthenticated && result.success) {
    const hourly = getHourlyLimiter();
    if (hourly) {
      const hourlyResult = await hourly.limit(identifier);
      if (!hourlyResult.success) {
        return {
          success: false,
          limit: RATE_LIMITS.authenticatedHourly.requests,
          remaining: hourlyResult.remaining,
          reset: hourlyResult.reset,
          retryAfter: Math.ceil((hourlyResult.reset - Date.now()) / 1000),
        };
      }
    }
  }

  return {
    success: result.success,
    limit: isAuthenticated ? RATE_LIMITS.authenticated.requests : RATE_LIMITS.anonymous.requests,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  };
}

// Get rate limit headers for response
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    ...(result.retryAfter && { "Retry-After": String(result.retryAfter) }),
  };
}
