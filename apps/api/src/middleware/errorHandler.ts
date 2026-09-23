import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  if (env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ error: code, message: status === 500 && env.NODE_ENV === 'production' ? 'Something broke' : err.message });
}
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
}
