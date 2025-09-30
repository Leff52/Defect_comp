import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { CommentService } from '../services/CommentService'
import { getPage } from '../utils/pagination'

const ParamDefect = z.object({ id: z.string().uuid() })
const ParamId = z.object({ id: z.string().uuid() })
const BodyCreate = z.object({ text: z.string().min(1).max(4000) })

export class CommentController {
	constructor(private readonly service: CommentService) {}

	listByDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamDefect.parse(req.params)
			const page = getPage(req)
			res.json(await this.service.list(id, page))
		} catch (e) {
			next(e)
		}
	}

	createForDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamDefect.parse(req.params)
			const { text } = BodyCreate.parse(req.body)
			const userId = (req as any).user?.id as string | undefined
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			const out = await this.service.create(id, userId, text)
			res.status(201).json(out)
		} catch (e) {
			next(e)
		}
	}
	remove = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamId.parse(req.params);
			const user = (req as any).user as
				| { id: string; roles: string[] }
				| undefined;
			if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

			const row = await this.service.getById(id);
			
			// Обеспечиваем что roles всегда массив
			const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles].filter(Boolean);
			const canModerate = userRoles.some(r =>
				['Manager', 'Lead', 'Admin'].includes(r)
			);
			
			if (row.author_id !== user.id && !canModerate) {
				return res.status(403).json({ error: 'Forbidden' });
			}
			res.json(await this.service.remove(id));
		} catch (e) {
			next(e)
		}
	}
}
