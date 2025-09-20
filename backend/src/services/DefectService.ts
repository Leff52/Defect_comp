import { Repository, ILike, SelectQueryBuilder } from 'typeorm'
import { Defect } from '../models/Defect'
import crypto from 'crypto'
import { NotFound, Forbidden } from '../utils/httpError'

// здесь я определяю интерфейс для входных данных при создании дефекта
interface CreateDefectInput {
	title: string
	project_id: string
	description?: string | null
	priority?: 'low' | 'med' | 'high' | 'critical'
}
const transitions: Record<string, string[]> = {
	new: ['in_work'],
	in_work: ['review'],
	review: ['closed', 'canceled'],
	closed: [],
	canceled: [],
}

const statusByRole = {
	Engineer: ['in_work', 'review'],
	Manager: ['in_work', 'review', 'closed', 'canceled'],
	Lead: ['in_work', 'review', 'closed', 'canceled'],
	Admin: ['in_work', 'review', 'closed', 'canceled'],
} as const

function canSetStatus(userRoles: string[], target: string) {
	return userRoles.some(r => (statusByRole as any)[r]?.includes(target))
}
// а это сервис для работы с дефектами, бизнес-логика вся тут, туси туси на тусе
export class DefectService {
	constructor(private readonly repo: Repository<Defect>) {}

	async list(limit = 20, offset = 0): Promise<Defect[]> {
		return this.repo.find({
			take: limit,
			skip: offset,
			order: { created_at: 'DESC' as any }, // ну тут я сортирую по дате создания, от новых к старым
		})
	}
	// я добавили обработку ошибки, если дефект не найден
	async getById(id: string) {
		const row = await this.repo.findOne({ where: { id } })
		if (!row) throw NotFound('Defect not found')
		return row
	}
	// здеся метод для создания нового дефекта
	async create(input: {
		title: string
		project_id: string
		description?: string | null
		priority?: 'low' | 'med' | 'high' | 'critical'
	}) {
		if (!input.title?.trim()) throw new Error('Title is required')
		const entity = this.repo.create({
			id: crypto.randomUUID(),
			project_id: input.project_id,
			stage_id: null,
			title: input.title,
			description: input.description ?? null,
			priority: input.priority ?? 'med',
			assignee_id: null,
			status: 'new',
			due_date: null,
			created_at: new Date(),
			updated_at: new Date(),
		})
		await this.repo.insert(entity)
		return { id: entity.id }
	}
	// частичное обновления дефекта
	async update(
		id: string,
		patch: Partial<
			Pick<
				Defect,
				| 'title'
				| 'description'
				| 'priority'
				| 'assignee_id'
				| 'due_date'
				| 'stage_id'
			>
		>
	) {
		const res = await this.repo.update(
			{ id },
			{ ...patch, updated_at: new Date() }
		)
		if (res.affected === 0) throw NotFound('Defect not found')
		return this.getById(id)
	}
	// удаление
	async remove(id: string) {
		const res = await this.repo.delete({ id })
		if (res.affected === 0) throw NotFound('Defect not found')
		return { ok: true }
	}

	// смена статуса с проверкой валидности перехода
	async changeStatus(
		id: string,
		newStatus: 'new' | 'in_work' | 'review' | 'closed' | 'canceled',
		userRoles: string[]
	) {
		const defect = await this.repo.findOne({ where: { id } })
		if (!defect) throw NotFound('Defect not found')

		const allowedNext = transitions[defect.status] || []
		if (!allowedNext.includes(newStatus)) {
			throw Forbidden(`Invalid transition: ${defect.status} → ${newStatus}`)
		}

		if (!canSetStatus(userRoles, newStatus)) {
			throw Forbidden(`Insufficient role to set status to ${newStatus}`)
		}

		defect.status = newStatus
		defect.updated_at = new Date()
		await this.repo.save(defect)
		return defect
	}
	async listAdvanced(params: {
		limit: number
		offset: number
		status?: 'new' | 'in_work' | 'review' | 'closed' | 'canceled'
		priority?: 'low' | 'med' | 'high' | 'critical'
		projectId?: string
		assigneeId?: string
		q?: string
		sort?: `${'created_at' | 'due_date'}:${'asc' | 'desc'}`
	}) {
		const qb: SelectQueryBuilder<Defect> = this.repo.createQueryBuilder('d')
		qb.orderBy('d.created_at', 'DESC').limit(params.limit).offset(params.offset)

		if (params.status)
			qb.andWhere('d.status = :status', { status: params.status })
		if (params.priority)
			qb.andWhere('d.priority = :priority', { priority: params.priority })
		if (params.projectId)
			qb.andWhere('d.project_id = :pid', { pid: params.projectId })
		if (params.assigneeId)
			qb.andWhere('d.assignee_id = :aid', { aid: params.assigneeId })
		if (params.q)
			qb.andWhere('(d.title ILIKE :q OR d.description ILIKE :q)', {
				q: `%${params.q}%`,
			})
		if (params.sort) {
			const [field, dir] = params.sort.split(':') as [
				'created_at' | 'due_date',
				'asc' | 'desc'
			]
			qb.orderBy(`d.${field}`, dir.toUpperCase() as 'ASC' | 'DESC')
		}

		const [items, total] = await qb.getManyAndCount()
		return { items, total }
	}
}
