import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ProjectService } from '../services/ProjectService'
import { getPage } from '../utils/pagination'

const QuerySchema = z.object({ q: z.string().min(1).optional() })
const CreateProjectSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	customer: z.string().optional(),
})
const UpdateProjectSchema = z.object({
	name: z.string().min(1).optional(),
	customer: z.string().optional(),
})
const ParamsSchema = z.object({
	id: z.string().uuid('Invalid project ID'),
})

export class ProjectController {
	constructor(private readonly service: ProjectService) {}

	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { q } = QuerySchema.parse(req.query)
			const page = getPage(req)
			const items = await this.service.list({ ...page, q: q ?? null })
			res.json(items)
		} catch (e) {
			next(e)
		}
	}

	getAllForSelect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const items = await this.service.getAllForSelect()
			res.json(items)
		} catch (e) {
			next(e)
		}
	}

	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamsSchema.parse(req.params)
			const project = await this.service.getById(id)
			res.json(project)
		} catch (e) {
			next(e)
		}
	}

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = CreateProjectSchema.parse(req.body)
			const project = await this.service.create(data)
			res.status(201).json(project)
		} catch (e) {
			next(e)
		}
	}

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamsSchema.parse(req.params)
			const data = UpdateProjectSchema.parse(req.body)
			const project = await this.service.update(id, data)
			res.json(project)
		} catch (e) {
			next(e)
		}
	}

	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamsSchema.parse(req.params)
			const result = await this.service.delete(id)
			res.json(result)
		} catch (e) {
			next(e)
		}
	}
}
