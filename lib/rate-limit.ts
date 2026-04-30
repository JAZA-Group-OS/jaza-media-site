/**
 * Simple in-memory token bucket rate limiter.
 *
 * Limitation: state lives in module memory, so each serverless instance has
 * its own counters. On Vercel, a sustained attack against many cold-start
 * instances could partially evade this. For production-grade limiting, swap
 * in `@upstash/ratelimit` with Upstash Redis or Vercel KV.
 *
 * For a solo-dev launch with modest traffic, this catches obvious floods.
 */

type Bucket = { count: number; windowStart: number };

const BUCKETS = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  options: { windowMs: number; max: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || now - bucket.windowStart >= options.windowMs) {
    BUCKETS.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: options.max - 1, resetMs: options.windowMs };
  }

  if (bucket.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: options.windowMs - (now - bucket.windowStart),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: options.max - bucket.count,
    resetMs: options.windowMs - (now - bucket.windowStart),
  };
}

/**
 * Pull the client IP from the request headers (Vercel/Cloudflare-aware).
 * Falls back to a single bucket if no IP is exposed (shouldn't happen on Vercel).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
