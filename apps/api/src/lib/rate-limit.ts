/**
 * In-memory rate limiter using a sliding window counter.
 *
 * Two usage modes:
 *  1. Elysia plugin  — use `generalRateLimit` / `authRateLimit` with .use()
 *  2. Raw fetch wrap — use `withRateLimit()` to wrap a .mount() handler
 *
 * Limits:
 *  - General: 100 req / 60 s per IP
 *  - Auth:      5 req / 60 s per IP
 */

import Elysia from "elysia";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Purge stale entries every 5 minutes to avoid unbounded growth.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Check rate limit for a given key.
 * Returns `null` on success, or a 429 Response when the limit is exceeded.
 */
function checkLimit(
  key: string,
  max: number,
  windowMs: number,
): Response | null {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return null;
  }

  entry.count++;

  if (entry.count > max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
      },
    });
  }

  return null;
}

// ---------------------------------------------------------------------------
// Elysia plugins
// ---------------------------------------------------------------------------

/** 100 req / 60 s — applied globally to all Elysia routes. */
export const generalRateLimit = new Elysia({ name: "rate-limit-general" }).derive(
  { as: "global" },
  ({ request }) => {
    const ip = getClientIp(request);
    const limited = checkLimit(`general:${ip}`, 100, 60_000);
    if (limited) throw limited;
    return {};
  },
);

/** 5 req / 60 s — applied to auth-sensitive Elysia routes. */
export const authRateLimit = new Elysia({ name: "rate-limit-auth" }).derive(
  { as: "scoped" },
  ({ request }) => {
    const ip = getClientIp(request);
    const limited = checkLimit(`auth:${ip}`, 5, 60_000);
    if (limited) throw limited;
    return {};
  },
);

// ---------------------------------------------------------------------------
// Raw fetch handler wrapper (for .mount() routes like Better Auth)
// ---------------------------------------------------------------------------

/**
 * Wraps a raw fetch handler with auth-level rate limiting (5 req / 60 s).
 *
 * Usage:
 *   .mount("/api/auth", withAuthRateLimit((request) => auth.handler(request)))
 */
export function withAuthRateLimit(
  handler: (request: Request) => Promise<Response> | Response,
): (request: Request) => Promise<Response> | Response {
  return (request: Request) => {
    const ip = getClientIp(request);
    const limited = checkLimit(`auth:${ip}`, 5, 60_000);
    if (limited) return limited;
    return handler(request);
  };
}
