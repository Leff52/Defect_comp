import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DefectService } from '../services/DefectService';
import { getPage } from '../utils/pagination'
import { Parser as Json2csvParser } from 'json2csv'
import ExcelJS from 'exceljs'

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

const ExportQuery = z.object({
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
			const { id } = IdSchema.parse(req.params);
			const { status } = StatusSchema.parse(req.body);
			const userRoles = (req as any).user?.roles ?? [];
			
			// Обеспечиваем что roles всегда массив
			const roles = Array.isArray(userRoles) ? userRoles : [userRoles].filter(Boolean);
			
			await this.service.changeStatus(id, status, roles);
			res.json({ success: true });
		} catch (e) {
			next(e);
		}
	};
	exportCsv = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = ExportQuery.parse(req.query)
			const rows = await this.service.exportAdvanced(q)

			// маппинг для приятных значений
			const mapPriority: any = {
				low: 'Низкий',
				med: 'Средний',
				high: 'Высокий',
				critical: 'Критичный',
			}
			const mapStatus: any = {
				new: 'Новая',
				in_work: 'В работе',
				review: 'На проверке',
				closed: 'Закрыта',
				canceled: 'Отменена',
			}

			const data = rows.map(r => ({
				id: r.id,
				title: r.title,
				status: mapStatus[r.status] ?? r.status,
				priority: mapPriority[r.priority] ?? r.priority,
				project_id: r.project_id,
				assignee_id: r.assignee_id ?? '',
				due_date: r.due_date ? new Date(r.due_date).toISOString() : '',
				created_at: new Date(r.created_at).toISOString(),
				updated_at: new Date(r.updated_at).toISOString(),
			}))

			const parser = new Json2csvParser({
				fields: [
					{ label: 'ID', value: 'id' },
					{ label: 'Заголовок', value: 'title' },
					{ label: 'Статус', value: 'status' },
					{ label: 'Приоритет', value: 'priority' },
					{ label: 'Проект', value: 'project_id' },
					{ label: 'Исполнитель', value: 'assignee_id' },
					{ label: 'Срок', value: 'due_date' },
					{ label: 'Создано', value: 'created_at' },
					{ label: 'Обновлено', value: 'updated_at' },
				],
				withBOM: true, // чтобы Excel на Windows корректно понимал UTF-8
			})

			const csv = parser.parse(data)
			const filename = `defects_${Date.now()}.csv`
			res.setHeader('Content-Type', 'text/csv; charset=utf-8')
			res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
			res.send(csv)
		} catch (e) {
			next(e)
		}
	}

	exportXlsx = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = ExportQuery.parse(req.query)
			const rows = await this.service.exportAdvanced(q)

			const workbook = new ExcelJS.Workbook()
			const sheet = workbook.addWorksheet('Defects')

			sheet.columns = [
				{ header: 'ID', key: 'id', width: 36 },
				{ header: 'Заголовок', key: 'title', width: 40 },
				{ header: 'Статус', key: 'status', width: 15 },
				{ header: 'Приоритет', key: 'priority', width: 12 },
				{ header: 'Проект', key: 'project_id', width: 36 },
				{ header: 'Исполнитель', key: 'assignee_id', width: 36 },
				{ header: 'Срок', key: 'due_date', width: 20 },
				{ header: 'Создано', key: 'created_at', width: 20 },
				{ header: 'Обновлено', key: 'updated_at', width: 20 },
			]

			const mapPriority: any = {
				low: 'Низкий',
				med: 'Средний',
				high: 'Высокий',
				critical: 'Критичный',
			}
			const mapStatus: any = {
				new: 'Новая',
				in_work: 'В работе',
				review: 'На проверке',
				closed: 'Закрыта',
				canceled: 'Отменена',
			}

			rows.forEach(r => {
				sheet.addRow({
					id: r.id,
					title: r.title,
					status: mapStatus[r.status] ?? r.status,
					priority: mapPriority[r.priority] ?? r.priority,
					project_id: r.project_id,
					assignee_id: r.assignee_id ?? '',
					due_date: r.due_date ? new Date(r.due_date).toISOString() : '',
					created_at: new Date(r.created_at).toISOString(),
					updated_at: new Date(r.updated_at).toISOString(),
				})
			})

			const filename = `defects_${Date.now()}.xlsx`
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			)
			res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
			await workbook.xlsx.write(res)
			res.end()
		} catch (e) {
			next(e)
		}
	}
}
