import { Repository } from 'typeorm'
import { Stage } from '../models/Stage'
import { AppDataSource } from '../config/data-source'

export class StageService {
	private repo: Repository<Stage> = AppDataSource.getRepository(Stage)

	async listByProject(
		projectId: string,
		{ limit, offset }: { limit: number; offset: number }
	) {
		const [items, total] = await this.repo.findAndCount({
			where: { project_id: projectId },
			order: { name: 'ASC' as any },
			take: limit,
			skip: offset,
		})
		return { items, total }
	}
}
