import { Repository } from 'typeorm'
import { Attachment } from '../models/Attachment'
import { AppDataSource } from '../config/data-source'
import crypto from 'crypto'
import fs from 'fs'
import { NotFound } from '../utils/httpError'

export class AttachmentService {
	private repo: Repository<Attachment> = AppDataSource.getRepository(Attachment)

	async list(defectId: string) {
		const [items, total] = await this.repo.findAndCount({
			where: { defect_id: defectId },
			order: { created_at: 'ASC' as any },
		})
		return { items, total }
	}

	async create(input: {
		defect_id: string
		author_id: string
		file_name: string
		mime_type: string
		size_bytes: number
		url_or_path: string
	}) {
		const row = this.repo.create({
			id: crypto.randomUUID(),
			defect_id: input.defect_id,
			author_id: input.author_id,
			file_name: input.file_name,
			mime_type: input.mime_type,
			size_bytes: String(input.size_bytes),
			url_or_path: input.url_or_path,
			created_at: new Date(),
		})
		await this.repo.insert(row)
		return { id: row.id, url: row.url_or_path }
	}

	async getById(id: string) {
		const row = await this.repo.findOne({ where: { id } })
		if (!row) throw NotFound('Вложение не найдено')
		return row
	}

	async remove(id: string) {
		const row = await this.getById(id)
		try {
			fs.unlinkSync(
				row.url_or_path.startsWith('/')
					? row.url_or_path.slice(1)
					: row.url_or_path
			)
		} catch {}
		await this.repo.delete({ id })
		return { ok: true }
	}
}
