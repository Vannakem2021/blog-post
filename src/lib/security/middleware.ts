import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from './rate-limit';

// Security configuration
const SECURITY_CONFIG = {
  // Paths that require rate limiting
  rateLimitedPaths: [
    '/api/',
    '/auth/',
    '/dashboard/',
  ],
  
  // Paths that require authentication
  protectedPaths: [
    '/dashboard',
  ],
  
  // Paths that should be blocked for non-admins
  adminOnlyPaths: [
    '/dashboard',
  ],
  
  // Suspicious patterns to block
  suspiciousPatterns: [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript protocol
    /data:.*base64/i,  // Data URLs
  ],
  
  // Blocked user agents
  blockedUserAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ],
  
  // Maximum request size (in bytes)
  maxRequestSize: 10 * 1024 * 1024, // 10MB
};

/**
 * Check if request contains suspicious patterns
 */
function containsSuspiciousPatterns(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check URL for suspicious patterns
  for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Check user agent
  for (const pattern of SECURITY_CONFIG.blockedUserAgents) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate request size
 */
function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= SECURITY_CONFIG.maxRequestSize;
  }
  return true;
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Log security event
 */
async function logSecurityEvent(
  eventType: string,
  request: NextRequest,
  details: Record<string, any> = {}
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    method: request.method,
    ...details,
  };
  
  // In production, send to logging service
  console.warn('Security Event:', logData);
}

/**
 * Create security response with appropriate headers
 */
function createSecurityResponse(
  status: number,
  message: string,
  request: NextRequest
): NextResponse {
  const response = new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

/**
 * Main security middleware function
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  try {
    // 1. Check for suspicious patterns
    if (containsSuspiciousPatterns(request)) {
      await logSecurityEvent('suspicious_request', request, {
        reason: 'suspicious_patterns',
      });
      
      return createSecurityResponse(
        400,
        'Bad Request',
        request
      );
    }
    
    // 2. Validate request size
    if (!validateRequestSize(request)) {
      await logSecurityEvent('request_too_large', request, {
        contentLength: request.headers.get('content-length'),
      });
      
      return createSecurityResponse(
        413,
        'Request Entity Too Large',
        request
      );
    }
    
    // 3. Apply rate limiting to specific paths
    const shouldRateLimit = SECURITY_CONFIG.rateLimitedPaths.some(path => 
      pathname.startsWith(path)
    );
    
    if (shouldRateLimit) {
      let config = RATE_LIMIT_CONFIGS.api;
      
      // Use specific rate limit configs for different paths
      if (pathname.startsWith('/auth/')) {
        config = RATE_LIMIT_CONFIGS.auth;
      } else if (pathname.startsWith('/api/posts')) {
        config = RATE_LIMIT_CONFIGS.posts;
      } else if (pathname.includes('upload')) {
        config = RATE_LIMIT_CONFIGS.upload;
      }
      
      const rateLimitResult = checkRateLimit(request, config);
      
      if (!rateLimitResult.allowed) {
        await logSecurityEvent('rate_limit_exceeded', request, {
          path: pathname,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        });
        
        const response = createSecurityResponse(
          429,
          rateLimitResult.message || 'Too Many Requests',
          request
        );
        
        response.headers.set('Retry-After', 
          Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        );
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
        
        return response;
      }
    }
    
    // 4. Additional security checks for API routes
    if (pathname.startsWith('/api/')) {
      // Check for required headers
      const contentType = request.headers.get('content-type');
      
      if (request.method === 'POST' || request.method === 'PUT') {
        if (!contentType || (!contentType.includes('application/json') && 
            !contentType.includes('multipart/form-data'))) {
          await logSecurityEvent('invalid_content_type', request, {
            contentType,
            method: request.method,
          });
          
          return createSecurityResponse(
            400,
            'Invalid Content-Type',
            request
          );
        }
      }
    }
    
    // 5. Log successful security check for sensitive paths
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
      await logSecurityEvent('access_granted', request, {
        path: pathname,
      });
    }
    
    return null; // Continue to next middleware
    
  } catch (error) {
    console.error('Security middleware error:', error);
    
    await logSecurityEvent('middleware_error', request, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return createSecurityResponse(
      500,
      'Internal Server Error',
      request
    );
  }
}

/**
 * Security headers for all responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers if not already present
  if (!response.headers.has('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  if (!response.headers.has('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'DENY');
  }
  
  if (!response.headers.has('X-XSS-Protection')) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  
  if (!response.headers.has('Referrer-Policy')) {
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  }
  
  return response;
}
