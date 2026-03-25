/**
 * API Rate Limiting Utility
 * Simple in-memory rate limiter for Astro API routes
 * Protects against abuse by limiting requests per IP/key
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly DEFAULT_MAX_REQUESTS = 60;   // 60 requests
  private readonly DEFAULT_WINDOW_MS = 60_000;   // per 1 minute

  /**
   * Check if a request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetIn: number }
   */
  check(
    key: string,
    maxRequests: number = this.DEFAULT_MAX_REQUESTS,
    windowMs: number = this.DEFAULT_WINDOW_MS
  ): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // If no entry or window has expired, create/reset
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetIn: windowMs,
      };
    }

    // Increment count
    entry.count++;

    // Check if over limit
    if (entry.count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetIn: entry.resetTime - now,
    };
  }

  /**
   * Create a rate-limited API response if limit exceeded
   */
  createLimitedResponse(resetIn: number): Response {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(resetIn / 1000)),
        },
      }
    );
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit presets for different endpoint types
export const RateLimitPresets = {
  /** Standard API operations: 60 req/min */
  STANDARD: { maxRequests: 60, windowMs: 60_000 },
  /** Read-heavy operations: 120 req/min */
  READ: { maxRequests: 120, windowMs: 60_000 },
  /** Write operations: 30 req/min */
  WRITE: { maxRequests: 30, windowMs: 60_000 },
  /** Auth operations: 10 req/min (prevent brute force) */
  AUTH: { maxRequests: 10, windowMs: 60_000 },
  /** Export/PDF generation: 10 req/min */
  EXPORT: { maxRequests: 10, windowMs: 60_000 },
} as const;

/**
 * Helper to extract a rate limit key from Astro request
 * Uses X-Forwarded-For header or falls back to a generic key
 */
export function getRateLimitKey(request: Request, prefix: string = 'api'): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:${ip}`;
}

/**
 * Middleware-style function for easy use in API routes
 * Returns null if allowed, or a Response if rate limited
 */
export function checkRateLimit(
  request: Request,
  preset: keyof typeof RateLimitPresets = 'STANDARD',
  prefix?: string
): Response | null {
  const key = getRateLimitKey(request, prefix || preset.toLowerCase());
  const config = RateLimitPresets[preset];
  const result = rateLimiter.check(key, config.maxRequests, config.windowMs);

  if (!result.allowed) {
    return rateLimiter.createLimitedResponse(result.resetIn);
  }

  return null;
}

// Clean up expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60_000);
}
