import { NextFunction, Request, Response } from 'express'
export type Role = 'Engineer' | 'Manager' | 'Lead' | 'Admin'
export function authMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	const hdr = String(req.header('X-Role') || 'Engineer') // x-role менеджер по умолчанию
	// проверка, если нет то по умолчанию инженер
	const role = (
		['Engineer', 'Manager', 'Lead', 'Admin'].includes(hdr) ? hdr : 'Engineer'
	) as Role
	;(req as any).user = { id: 'demo-user', role }
	next()
}