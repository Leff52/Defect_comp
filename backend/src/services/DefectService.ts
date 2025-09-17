import { Repository } from 'typeorm';
import { Defect } from '../models/Defect';
import crypto from 'crypto';
import { NotFound } from '../utils/httpError'

// здесь я определяю интерфейс для входных данных при создании дефекта
interface CreateDefectInput {
  title: string;
  project_id: string;
  description?: string | null;
  priority?: 'low' | 'med' | 'high' | 'critical';
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
}
