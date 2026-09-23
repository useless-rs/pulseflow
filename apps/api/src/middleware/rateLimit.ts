import type { Request, Response, NextFunction } from 'express';

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW = 60_000;
const LIMIT = 100;

// Evict expired buckets so the map can't grow unbounded (IPs churn).
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
}, WINDOW);
sweeper.unref?.();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = (req.ip ?? 'anon') as string;
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || now > cur.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW });
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', LIMIT - 1);
    next();
    return;
  }
  cur.count += 1;
  res.setHeader('X-RateLimit-Limit', LIMIT);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - cur.count));
  if (cur.count > LIMIT) { res.status(429).json({ error: 'RATE_LIMITED', retryAfter: Math.ceil((cur.reset - now) / 1000) }); return; }
  next();
}
