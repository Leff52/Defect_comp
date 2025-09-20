import { Request, Response, NextFunction } from 'express'
// требует чтобы пользователь имел одну из указанных ролей, хотя бы одну
export function requireRole(
	...allowed: Array<'Engineer' | 'Manager' | 'Lead' | 'Admin'>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		const roles: string[] = (req as any).user?.roles ?? []
		if (roles.some(r => allowed.includes(r as any))) return next()
		return res
			.status(403)
			.json({ error: `Forbidden: requires role ${allowed.join(' or ')}` })
	}
}
const statusRoleMap: Record<
	string,
	Array<'Engineer' | 'Manager' | 'Lead' | 'Admin'>
> = {
	in_work: ['Engineer', 'Manager', 'Lead', 'Admin'],
	review: ['Engineer', 'Manager', 'Lead', 'Admin'],
	closed: ['Manager', 'Lead', 'Admin'],
	canceled: ['Manager', 'Lead', 'Admin'],
}

export function requireRoleForStatus() {
	return (req: Request, res: Response, next: NextFunction) => {
		const target = String(req.body?.status ?? '').trim()
		const allowed = statusRoleMap[target]
		if (!allowed)
			return res.status(400).json({ error: 'Unknown or disallowed status' })

		const roles: string[] = (req as any).user?.roles ?? []
		if (roles.some(r => allowed.includes(r as any))) return next()

		return res
			.status(403)
			.json({ error: `Forbidden: ${target} requires ${allowed.join(' or ')}` })
	}
}
