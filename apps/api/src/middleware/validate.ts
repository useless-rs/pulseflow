import type { Request, Response, NextFunction } from 'express';
export function validate(schema: { parseAsync: (v: unknown) => Promise<unknown> }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try { req.body = await schema.parseAsync(req.body); next(); }
    catch (e: any) { res.status(422).json({ error: 'VALIDATION_ERROR', details: e.errors ?? e.message }); }
  };
}
