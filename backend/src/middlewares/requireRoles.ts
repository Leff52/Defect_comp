import { toRoleArray } from '../utils/roles';
import { Request, Response, NextFunction } from 'express';

export const requireRoles = (allowed: string[]) =>
	(req: Request, res: Response, next: NextFunction) => {
		const roles = toRoleArray((req as any).user?.roles);
		if (!roles.some(r => allowed.includes(r))) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		next();
	};