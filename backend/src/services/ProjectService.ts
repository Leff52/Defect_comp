import { Repository, ILike } from 'typeorm'
import { Project } from '../models/Project'
import { AppDataSource } from '../config/data-source'
import { randomUUID } from 'crypto'

export class ProjectService {
	private repo: Repository<Project> = AppDataSource.getRepository(Project)

	async list({
		limit,
		offset,
		q,
	}: {
		limit: number
		offset: number
		q?: string | null
	}) {
		const where = q ? { name: ILike(`%${q}%`) } : {}
		const [items, total] = await this.repo.findAndCount({
			where,
			order: { created_at: 'DESC' as any },
			take: limit,
			skip: offset,
		})
		return {
			items,
			total,
			limit,
			offset,
		}
	}

	async getAllForSelect() {
		return this.repo.find({
			select: ['id', 'name'],
			order: { name: 'ASC' as any },
		})
	}

	async getById(id: string) {
		const project = await this.repo.findOne({ where: { id } })
		if (!project) {
			throw new Error('Проект не найден')
		}
		return project
	}

	async create(data: { name: string; customer?: string }) {
		const project = this.repo.create({
			id: randomUUID(),
			name: data.name,
			customer: data.customer || null,
			created_at: new Date(),
			updated_at: new Date(),
		})
		return this.repo.save(project)
	}

	async update(id: string, data: { name?: string; customer?: string }) {
		const project = await this.getById(id)
		
		if (data.name !== undefined) project.name = data.name
		if (data.customer !== undefined) project.customer = data.customer || null
		project.updated_at = new Date()

		return this.repo.save(project)
	}

	async delete(id: string) {
		const project = await this.getById(id)
		await this.repo.remove(project)
		return { message: 'Проект успешно удален' }
	}
}
