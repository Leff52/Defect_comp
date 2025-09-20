import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { StageService } from '../services/StageService'
import { getPage } from '../utils/pagination'

const QuerySchema = z.object({ projectId: z.string().uuid() })

export class StageController {
	constructor(private readonly service: StageService) {}
	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId } = QuerySchema.parse(req.query)
			const page = getPage(req)
			const out = await this.service.listByProject(projectId, page)
			res.json(out)
		} catch (e) {
			next(e)
		}
	}
}
