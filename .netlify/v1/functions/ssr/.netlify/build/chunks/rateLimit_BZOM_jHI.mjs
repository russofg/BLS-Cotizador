class RateLimiter {
  limits = /* @__PURE__ */ new Map();
  DEFAULT_MAX_REQUESTS = 60;
  // 60 requests
  DEFAULT_WINDOW_MS = 6e4;
  // per 1 minute
  /**
   * Check if a request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetIn: number }
   */
  check(key, maxRequests = this.DEFAULT_MAX_REQUESTS, windowMs = this.DEFAULT_WINDOW_MS) {
    const now = Date.now();
    const entry = this.limits.get(key);
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetIn: windowMs
      };
    }
    entry.count++;
    if (entry.count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetTime - now
      };
    }
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetIn: entry.resetTime - now
    };
  }
  /**
   * Create a rate-limited API response if limit exceeded
   */
  createLimitedResponse(resetIn) {
    return new Response(
      JSON.stringify({
        error: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
        retryAfter: Math.ceil(resetIn / 1e3)
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(resetIn / 1e3))
        }
      }
    );
  }
  /**
   * Clean up expired entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}
const rateLimiter = new RateLimiter();
const RateLimitPresets = {
  /** Standard API operations: 60 req/min */
  STANDARD: { maxRequests: 60, windowMs: 6e4 },
  /** Read-heavy operations: 120 req/min */
  READ: { maxRequests: 120, windowMs: 6e4 },
  /** Write operations: 30 req/min */
  WRITE: { maxRequests: 30, windowMs: 6e4 },
  /** Auth operations: 10 req/min (prevent brute force) */
  AUTH: { maxRequests: 10, windowMs: 6e4 },
  /** Export/PDF generation: 10 req/min */
  EXPORT: { maxRequests: 10, windowMs: 6e4 }
};
function getRateLimitKey(request, prefix = "api") {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}
function checkRateLimit(request, preset = "STANDARD", prefix) {
  const key = getRateLimitKey(request, prefix || preset.toLowerCase());
  const config = RateLimitPresets[preset];
  const result = rateLimiter.check(key, config.maxRequests, config.windowMs);
  if (!result.allowed) {
    return rateLimiter.createLimitedResponse(result.resetIn);
  }
  return null;
}
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 6e4);
}

export { checkRateLimit as c };
