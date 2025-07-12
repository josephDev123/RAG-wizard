import { rateLimit } from "express-rate-limit";
interface IRatelimiter {
  windowMs: number;
  limit: number;
  standardHeaders: boolean | "draft-6" | "draft-7" | "draft-8" | undefined;
  legacyHeaders: boolean | undefined;
}

export function ratelimitMiddleware({
  windowMs,
  limit,
  standardHeaders,
  legacyHeaders,
}: IRatelimiter) {
  return rateLimit({
    windowMs: windowMs, // 15 minutes
    limit: limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: standardHeaders, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: legacyHeaders, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  });
}
