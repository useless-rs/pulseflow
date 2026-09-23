import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export function validateBody(schema: ZodType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.safeParseAsync(req.body);
    if (!parsed.success) { res.status(422).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T extends ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.safeParseAsync(req.query);
    if (!parsed.success) { res.status(422).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
    req.query = parsed.data as Request['query'];
    next();
  };
}

/** @deprecated use validateBody */
export const validate = validateBody;
