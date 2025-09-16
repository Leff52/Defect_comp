import { NextFunction, Request, Response } from 'express';
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  (req as any).user = { id: 'demo-user' }; next();
}