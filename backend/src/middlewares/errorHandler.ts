import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err); res.status(err?.status||400).json({ error: err?.message||'Bad request' });
}