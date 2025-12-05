// Rate limiting utility
// Simple in-memory rate limiter (for production, consider Redis)

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key)
      }
    }
  }

  /**
   * Check if request is within rate limit
   * @param key Unique identifier (e.g., userId, IP address)
   * @param maxRequests Maximum requests allowed
   * @param windowMs Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetAt) {
      // Create new entry
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      })
      return true
    }

    if (entry.count >= maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key)
    if (!entry) return maxRequests
    return Math.max(0, maxRequests - entry.count)
  }

  /**
   * Get reset time
   */
  getResetTime(key: string): number | null {
    const entry = this.limits.get(key)
    return entry ? entry.resetAt : null
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string) {
    this.limits.delete(key)
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.limits.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  API_GENERAL: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  API_LOOKUP: { maxRequests: 30, windowMs: 60000 }, // 30 lookups per minute
  API_UPLOAD: { maxRequests: 10, windowMs: 60000 }, // 10 uploads per minute
  
  // Authentication
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number | null } {
  const allowed = rateLimiter.check(key, maxRequests, windowMs)
  const remaining = rateLimiter.getRemaining(key, maxRequests)
  const resetAt = rateLimiter.getResetTime(key)

  return {
    allowed,
    remaining,
    resetAt,
  }
}

/**
 * Get rate limit key from request (user ID or IP)
 */
export function getRateLimitKey(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

export default rateLimiter

