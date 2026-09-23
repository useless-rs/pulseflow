import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing token' }); return; }
  try {
    (req as any).user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}
