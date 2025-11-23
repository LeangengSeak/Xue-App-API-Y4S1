import { Request, Response, NextFunction } from "express";
import { HTTPSTATUS } from "../config/http.config";

type KeyGenerator = (req: Request) => string;

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: KeyGenerator;
  message?: string;
}

interface Entry {
  count: number;
  expiresAt: number;
}

const store = new Map<string, Entry>();

function cleanup() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt <= now) store.delete(k);
  }
}

setInterval(cleanup, 60_000).unref();

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator, message } = options;

  const getKey: KeyGenerator = keyGenerator
    ? keyGenerator
    : (req: Request) =>
        req.ip || (req.headers["x-forwarded-for"] as string) || "unknown";

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getKey(req);
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.expiresAt <= now) {
        store.set(key, { count: 1, expiresAt: now + windowMs });
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(max - 1));
        return next();
      }

      if (entry.count >= max) {
        const retryAfterSec = Math.ceil((entry.expiresAt - now) / 1000);
        res.setHeader("Retry-After", String(retryAfterSec));
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", "0");
        return res.status(HTTPSTATUS.TOO_MANY_REQUESTS).json({
          message: message || "Too many requests, please try again later.",
        });
      }

      entry.count += 1;
      store.set(key, entry);
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader(
        "X-RateLimit-Remaining",
        String(Math.max(0, max - entry.count))
      );
      return next();
    } catch (err) {
      return next();
    }
  };
}

export default createRateLimiter;
