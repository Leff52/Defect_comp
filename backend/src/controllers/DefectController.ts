import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DefectService } from '../services/DefectService';
import { getPage } from '../utils/pagination'

// снизу это схема для валидации запросов на создание дефекта, вау
const CreateSchema = z.object({
	title: z.string().min(1).max(120),
	project_id: z.string().uuid(),
	description: z.string().max(4000).optional(),
	priority: z
		.enum(['low', 'med', 'high', 'critical'])
		.default('med')
		.optional(),
})
// схема для валидации статуса дефекта
const StatusSchema = z.object({
	status: z.enum(['new', 'in_work', 'review', 'closed', 'canceled']),
})
const IdSchema = z.object({ id: z.string().uuid() }); // схема для валидации UUID
// нужен хотя бы один параметр для обновления
const PatchSchema = z
	.object({
		title: z.string().min(1).max(120).optional(),
		description: z.string().max(4000).nullable().optional(),
		priority: z.enum(['low', 'med', 'high', 'critical']).optional(),
		assignee_id: z.string().uuid().nullable().optional(),
		due_date: z.string().date().nullable().optional(),
		stage_id: z.string().uuid().nullable().optional(),
	})
	.refine(obj => Object.keys(obj).length > 0, {
		message: 'At least one field required',
	})
const ListQuery = z.object({
	status: z.enum(['new', 'in_work', 'review', 'closed', 'canceled']).optional(),
	priority: z.enum(['low', 'med', 'high', 'critical']).optional(),
	projectId: z.string().uuid().optional(),
	assigneeId: z.string().uuid().optional(),
	q: z.string().min(1).optional(),
	sort: z
		.enum(['created_at:asc', 'created_at:desc', 'due_date:asc', 'due_date:desc'])
		.optional(),
})


// а это контроллер для обработки HTTP запросов, связанных с дефектами, да, вот так вот
export class DefectController {
	constructor(private readonly service: DefectService) {}

	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = ListQuery.parse(req.query)
			const page = getPage(req)
			const out = await this.service.listAdvanced({ ...page, ...q })
			res.json(out)
		} catch (e) {
			next(e)
		}
	}
	// метод для получения дефекта по id, йоу
	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = IdSchema.parse(req.params)
			const item = await this.service.getById(id)
			res.json(item)
		} catch (e) {
			next(e)
		}
	}

	// а это метод для создания нового дефекта
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const dto = CreateSchema.parse(req.body)
			const result = await this.service.create(dto)

			res.status(201).json(result)
		} catch (e) {
			next(e)
		}
	}
	// метод для частичного обновления дефекта
	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = IdSchema.parse(req.params)
			const patch = PatchSchema.parse(req.body)
			const updated = await this.service.update(id, patch as any)
			res.json(updated)
		} catch (e) {
			next(e)
		}
	}
	// удаление дефекта по id
	remove = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = IdSchema.parse(req.params)
			const out = await this.service.remove(id)
			res.json(out)
		} catch (e) {
			next(e)
		}
	}
	// изменения статуса дефекта
	changeStatus = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = IdSchema.parse(req.params)
			const { status } = StatusSchema.parse(req.body)
			const role = (req as any).user?.role ?? 'Engineer'
			const updated = await this.service.changeStatus(id, status, role)
			res.json(updated)
		} catch (e) {
			next(e)
		}
	}
}
