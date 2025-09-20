import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { CommentService } from '../services/CommentService'
import { getPage } from '../utils/pagination'

const IdParam = z.object({ id: z.string().uuid() })
const DefectParam = z.object({ id: z.string().uuid() })
const CreateBody = z.object({ text: z.string().min(1).max(4000) })

export class CommentController {
	constructor(private readonly service: CommentService) {}

	listByDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = DefectParam.parse(req.params)
			const page = getPage(req)
			res.json(await this.service.list(id, page))
		} catch (e) {
			next(e)
		}
	}

	createForDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = DefectParam.parse(req.params)
			const { text } = CreateBody.parse(req.body)
			const authorId = (req as any).user?.id as string
			const out = await this.service.create(id, authorId, text)
			res.status(201).json(out)
		} catch (e) {
			next(e)
		}
	}

	remove = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = IdParam.parse(req.params)
			res.json(await this.service.remove(id))
		} catch (e) {
			next(e)
		}
	}
}
