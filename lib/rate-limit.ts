/**
 * Rate limiter with Upstash Redis when configured, in-memory fallback otherwise.
 *
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to use the distributed
 * counter (recommended for production — survives multi-instance/serverless).
 * Without those, we fall back to a per-instance in-memory bucket — fine for
 * local dev, leaky under real load on Vercel.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Bucket = { count: number; windowStart: number };

const BUCKETS = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashEnabled = Boolean(upstashUrl && upstashToken);

const redis = upstashEnabled
  ? new Redis({ url: upstashUrl!, token: upstashToken! })
  : null;

// Cache one Ratelimit instance per (windowMs:max) pair so we don't recreate
// the sliding-window helper on every call.
const rlCache = new Map<string, Ratelimit>();

function getRl(options: { windowMs: number; max: number }): Ratelimit | null {
  if (!redis) return null;
  const key = `${options.windowMs}:${options.max}`;
  let rl = rlCache.get(key);
  if (!rl) {
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.max, `${options.windowMs} ms`),
      analytics: false,
      prefix: 'jaza-rl',
    });
    rlCache.set(key, rl);
  }
  return rl;
}

export async function rateLimit(
  key: string,
  options: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  const rl = getRl(options);
  if (rl) {
    const result = await rl.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetMs: Math.max(0, result.reset - Date.now()),
    };
  }

  // In-memory fallback (single-instance only).
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
