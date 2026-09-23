import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenClaims } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenClaims;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing token' }); return; }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}
