import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const header = req.header('Authorization')
	if (!header?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Missing or invalid token' })
	}
	try {
		const payload = AuthService.verify(header.substring(7)) 
		;(req as any).user = payload
		next()
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token' })
	}
}
