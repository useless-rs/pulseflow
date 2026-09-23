import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  reset: number;
}

export function createRateLimiter(windowMs: number, limit: number) {
  const hits = new Map<string, Bucket>();
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }, windowMs);
  sweeper.unref?.();

  const middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = (req.ip ?? 'anon') as string;
    const now = Date.now();
    const cur = hits.get(key);
    if (!cur || now > cur.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      next();
      return;
    }
    cur.count += 1;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - cur.count));
    if (cur.count > limit) {
      res.status(429).json({ error: 'RATE_LIMITED', retryAfter: Math.ceil((cur.reset - now) / 1000) });
      return;
    }
    next();
  };

  middleware.reset = () => hits.clear();
  return middleware;
}

export const rateLimit = createRateLimiter(60_000, 100);
export const authLimiter = createRateLimiter(10 * 60_000, 10);
