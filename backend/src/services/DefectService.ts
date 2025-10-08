import { Repository, SelectQueryBuilder } from 'typeorm';
import { Defect } from '../models/Defect';
import crypto from 'crypto';
import { NotFound, Forbidden } from '../utils/httpError';

// Типы для статуса и приоритета
type Status = 'new' | 'in_work' | 'review' | 'closed' | 'canceled';
type Priority = 'low' | 'med' | 'high' | 'critical';

// входные данные при создании дефекта
interface CreateDefectInput {
	title: string;
	project_id: string;
	description?: string | null;
	priority?: Priority;
}

// матрица переходов по статусам
const transitions: Record<string, string[]> = {
	new: ['in_work'],
	in_work: ['review'],
	review: ['closed', 'canceled'],
	closed: [],
	canceled: [],
}

// разрешения статусов по ролям
const statusByRole = {
	Engineer: ['in_work', 'review'],
	Manager: ['in_work', 'review', 'closed', 'canceled'],
	Lead: ['in_work', 'review', 'closed', 'canceled'],
	Admin: ['in_work', 'review', 'closed', 'canceled'],
} as const;

export class DefectService {
	constructor(private readonly repo: Repository<Defect>) {}

	async list(limit = 20, offset = 0): Promise<Defect[]> {
		return this.repo.find({
			take: limit,
			skip: offset,
			order: { created_at: 'DESC' as any },
		})
	}

	async getById(id: string) {
		const row = await this.repo.findOne({ where: { id } })
		if (!row) throw NotFound('Defect not found')
		return row
	}

	async create(input: CreateDefectInput) {
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
		if (res.affected === 0) throw NotFound('Дефект не обнаружен')
		return this.getById(id)
	}

	async remove(id: string) {
		const res = await this.repo.delete({ id })
		if (res.affected === 0) throw NotFound('Дефект не обнаружен')
		return { ok: true }
	}
	
	async changeStatus(
		id: string,
		newStatus: Status,
		userRoles: string[] | string
	) {
		// Нормализуем роли в массив как в AuthController
		const roles = Array.isArray(userRoles) ? userRoles : [userRoles].filter(Boolean);
		const allowed = ['Admin', 'Manager', 'Lead','Engineer'];
		
		if (!roles.some(r => allowed.includes(r))) {
			throw Forbidden('Изменить статус может только администратор/менеджер')
		}

		const defect = await this.repo.findOne({ where: { id } });
		if (!defect) throw NotFound('Дефект не найден');

		const allowedNext = transitions[defect.status] || [];
		if (!allowedNext.includes(newStatus)) {
			throw Forbidden(`Недопустимый переход: ${defect.status} → ${newStatus}`);
		}

		defect.status = newStatus;
		defect.updated_at = new Date();
		await this.repo.save(defect);
		return defect;
	}

	private buildQb(params: {
		status?: Status;
		priority?: Priority;
		projectId?: string;
		assigneeId?: string;
		q?: string;
		sort?: `${'created_at' | 'due_date'}:${'asc' | 'desc'}`;
	}) {
		const qb: SelectQueryBuilder<Defect> = this.repo.createQueryBuilder('d')

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

		const [field, dir] = (params.sort ?? 'created_at:desc').split(':') as [
			'created_at' | 'due_date',
			'asc' | 'desc'
		]
		qb.orderBy(`d.${field}`, dir.toUpperCase() as 'ASC' | 'DESC')

		return qb
	}

	// пагинированный список
	async listAdvanced(params: {
		limit: number;
		offset: number;
		status?: Status;
		priority?: Priority;
		projectId?: string;
		assigneeId?: string;
		q?: string;
		sort?: `${'created_at' | 'due_date'}:${'asc' | 'desc'}`;
	}) {
		const qb = this.buildQb(params).limit(params.limit).offset(params.offset)
		const [items, total] = await qb.getManyAndCount()
		return { items, total }
	}

	// экспорт
	async exportAdvanced(params: {
		status?: Status;
		priority?: Priority;
		projectId?: string;
		assigneeId?: string;
		q?: string;
		sort?: `${'created_at' | 'due_date'}:${'asc' | 'desc'}`;
	}) {
		const qb = this.buildQb(params)
		return await qb.getMany()
	}
}
