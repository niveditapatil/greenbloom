import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Lazy singletons so Next.js doesn't construct them at import time
// during the build step (which runs without env vars present).
let _ipLimiter: Ratelimit | null = null
let _globalLimiter: Ratelimit | null = null

/**
 * Rate limiting is active only when:
 *   1. We're running in production (NODE_ENV === "production"), AND
 *   2. Both Upstash env vars are configured.
 *
 * Local `npm run dev` always skips limits so the maintainer can iterate
 * freely. Vercel sets NODE_ENV=production automatically, so prod stays
 * protected.
 */
export const isRateLimitEnabled = (): boolean =>
  process.env.NODE_ENV === "production" &&
  Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  )

function makeRedis() {
  return Redis.fromEnv()
}

/**
 * Per-IP limit: 5 generations per hour.
 * Sized for a portfolio demo — generous enough that a
 * legitimate visitor can experiment, tight enough that
 * a single attacker can't drain credits from one machine.
 */
export function ipLimiter(): Ratelimit {
  if (!_ipLimiter) {
    _ipLimiter = new Ratelimit({
      redis: makeRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:generate:ip",
      analytics: true,
    })
  }
  return _ipLimiter
}

/**
 * Site-wide cap: 100 generations per day.
 * Last line of defense against distributed attacks
 * (rotating IPs, botnets) — caps daily fal.ai spend at
 * ~$4 worst case ($0.04/image x 100 images).
 */
export function globalLimiter(): Ratelimit {
  if (!_globalLimiter) {
    _globalLimiter = new Ratelimit({
      redis: makeRedis(),
      limiter: Ratelimit.slidingWindow(100, "1 d"),
      prefix: "ratelimit:generate:global",
      analytics: true,
    })
  }
  return _globalLimiter
}
