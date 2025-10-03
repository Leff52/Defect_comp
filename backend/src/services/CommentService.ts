import { Repository } from 'typeorm'
import { Comment } from '../models/Comment'
import { AppDataSource } from '../config/data-source'
import crypto from 'crypto'
import { NotFound } from '../utils/httpError'

export class CommentService {
	private repo: Repository<Comment> = AppDataSource.getRepository(Comment)
	async getById(id: string) {
		const row = await this.repo.findOne({ where: { id } })
		if (!row) throw NotFound('Комментарий не найден')
		return row
	}
	async list(
		defectId: string,
		{ limit, offset }: { limit: number; offset: number }
	) {
		const [items, total] = await this.repo.findAndCount({
			where: { defect_id: defectId },
			order: { created_at: 'ASC' as any },
			take: limit,
			skip: offset,
		})
		return { items, total }
	}

	async create(defectId: string, authorId: string, text: string) {
		const row = this.repo.create({
			id: crypto.randomUUID(),
			defect_id: defectId,
			author_id: authorId,
			text,
			created_at: new Date(),
		})
		await this.repo.insert(row)
		return { id: row.id }
	}

	async remove(id: string) {
		const res = await this.repo.delete({ id })
		if (res.affected === 0) throw NotFound('Комментарий не найден')
		return { ok: true }
	}
}
