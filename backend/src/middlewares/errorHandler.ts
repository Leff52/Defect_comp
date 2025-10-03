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
	
	console.error(err);
	logger.error(err);
	
	const status = err.status || (err.code === 'ENOENT' ? 404 : 500);
	res.status(status).json({
		error: err.message || 'Внутренняя ошибка сервера',
		code: err.code || undefined,
	})
}
