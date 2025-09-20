import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ProjectService } from '../services/ProjectService'
import { getPage } from '../utils/pagination'

const QuerySchema = z.object({ q: z.string().min(1).optional() })

export class ProjectController {
	constructor(private readonly service: ProjectService) {}
	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { q } = QuerySchema.parse(req.query)
			const page = getPage(req)
			const out = await this.service.list({ ...page, q: q ?? null })
			res.json(out)
		} catch (e) {
			next(e)
		}
	}
}
