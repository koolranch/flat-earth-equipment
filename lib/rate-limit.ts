/**
 * Simple rate limiting using Vercel Edge Config or in-memory cache
 * Prevents API abuse and bot scraping
 */

import { NextRequest } from 'next/server';

// In-memory store for rate limiting (resets on deployment)
// For production, consider Redis or Vercel KV
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Check if request should be rate limited
 * Returns true if request should be blocked
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 100, windowMs: 60000 } // 100 requests per minute default
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No record or expired window - create new
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { limited: false, remaining: config.limit - 1, resetTime: now + config.windowMs };
  }

  // Increment count
  record.count++;

  // Check if over limit
  if (record.count > config.limit) {
    return { limited: true, remaining: 0, resetTime: record.resetTime };
  }

  return { limited: false, remaining: config.limit - record.count, resetTime: record.resetTime };
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  // Vercel provides this header
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Clean up old entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

