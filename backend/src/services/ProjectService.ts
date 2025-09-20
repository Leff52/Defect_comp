import { Repository, ILike } from 'typeorm'
import { Project } from '../models/Project'
import { AppDataSource } from '../config/data-source'

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
		return { items, total }
	}
}
