import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
export function errorHandler(
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	logger.error(err)
	const status = typeof err?.status === 'number' ? err.status : 500
	res.status(status).json({ error: err?.message ?? 'Internal Server Error' })
}
