/**
 * Shared rate-limit helper — in-process sliding window.
 *
 * Uses a plain Map keyed by the caller-supplied string. Each entry holds an
 * array of request timestamps within the current window; old timestamps are
 * evicted on every check.
 *
 * Trade-off: each Vercel / Node.js process has its own counter, so limits are
 * per-instance rather than globally distributed. This is acceptable for
 * low-traffic endpoints like invite-code validation. If you later need
 * distributed limiting, swap this implementation for a Supabase-backed or
 * Redis-backed one — the exported interface is identical.
 *
 * No external services or env vars required.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix epoch ms when the oldest request in the window expires
}

// Global store — lives for the lifetime of the server process.
const store = new Map<string, number[]>();

/**
 * Check a rate-limit bucket using a sliding-window algorithm.
 *
 * @param key       Unique bucket key, e.g. "validate-code:1.2.3.4"
 * @param max       Maximum allowed requests within the window
 * @param windowSec Window length in seconds
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1_000;
  const cutoff = now - windowMs;

  // Evict timestamps older than the window
  const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= max) {
    // Oldest timestamp determines when the next slot opens
    const reset = timestamps[0] + windowMs;
    return { success: false, remaining: 0, reset };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    success: true,
    remaining: max - timestamps.length,
    reset: now + windowMs,
  };
}
