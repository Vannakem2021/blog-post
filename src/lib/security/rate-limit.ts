import { NextRequest } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  },
  
  // Post creation/editing
  posts: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 post operations per minute
    message: 'Too many post operations. Please slow down.',
  },
  
  // General API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests. Please try again later.',
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 uploads per minute
    message: 'Too many upload attempts. Please wait before uploading again.',
  },
} as const;

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from session/auth
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `${clientId}:${request.nextUrl.pathname}`;

  // Clean up expired entries
  cleanupExpiredEntries(now);

  // Get current rate limit data
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // First request or window expired, create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      message: config.message || 'Rate limit exceeded',
    };
  }

  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (request: NextRequest): Promise<Response> => {
    const result = checkRateLimit(request, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(request);
    
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}

/**
 * Rate limiting for server actions
 */
export async function rateLimitServerAction(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; message?: string }> {
  const now = Date.now();
  const key = `action:${identifier}`;

  // Clean up expired entries
  cleanupExpiredEntries(now);

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      message: config.message || 'Too many requests. Please try again later.',
    };
  }

  current.count++;
  rateLimitStore.set(key, current);
  return { allowed: true };
}

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: RateLimitConfig
): { remaining: number; resetTime: number } {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const current = rateLimitStore.get(key);
  const now = Date.now();

  if (!current || now > current.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - current.count),
    resetTime: current.resetTime,
  };
}

/**
 * Reset rate limit for a specific client (admin function)
 */
export function resetRateLimit(clientId: string, path?: string): void {
  if (path) {
    const key = `${clientId}:${path}`;
    rateLimitStore.delete(key);
  } else {
    // Reset all rate limits for this client
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(clientId)) {
        rateLimitStore.delete(key);
      }
    }
  }
}
