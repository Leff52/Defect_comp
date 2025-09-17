import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      })),
    });
  }
  logger.error(err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: err?.message ?? 'Internal Server Error' });
}
