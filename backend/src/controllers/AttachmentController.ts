import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import contentDisposition from 'content-disposition'
import mime from 'mime-types'
import fs from 'fs'
import path from 'path'
import { AttachmentService } from '../services/AttachmentService'
import { getPublicUrl } from '../utils/upload'

const ParamDefect = z.object({ id: z.string().uuid() })
const ParamId = z.object({ id: z.string().uuid() })

// функция для исправления 
function tryFixMojibake(name: string): string {
	const repaired = Buffer.from(name, 'latin1').toString('utf8')
	const looksCyr = /[а-яё]/i.test(repaired)
	return looksCyr ? repaired : name
}

export class AttachmentController {
	constructor(private readonly service: AttachmentService) {}

	listByDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamDefect.parse(req.params)
			res.json(await this.service.list(id))
		} catch (e) {
			next(e)
		}
	}

	uploadForDefect = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamDefect.parse(req.params)
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const f = (req as any).file as Express.Multer.File | undefined
			if (!f) return res.status(400).json({ error: 'File is required' })

			const out = await this.service.create({
				defect_id: id,
				author_id: userId,
				file_name: f.originalname,
				mime_type: f.mimetype,
				size_bytes: f.size,
				url_or_path: `/${f.destination}/${f.filename}`, // для статики
			})

			res.status(201).json({ id: out.id, url: getPublicUrl(f.filename) })
		} catch (e) {
			next(e)
		}
	}

	remove = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamId.parse(req.params);
			const user = req.user;
			if (!user) return res.status(401).json({ error: 'Unauthorized' });
			const row = await this.service.getById(id);
			
			const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles].filter(Boolean);
			
			if (userRoles.includes('Engineer')) {
				return res.status(403).json({ error: 'Engineers cannot delete attachments' });
			}
			const canDelete = userRoles.some(r => ['Manager', 'Lead', 'Admin'].includes(r));
			
			if (!canDelete) {
				return res.status(403).json({ error: 'Forbidden' });
			}
			
			await this.service.remove(id);
			res.json({ message: 'Attachment deleted successfully' });
		} catch (e) {
			next(e)
		}
	}

	download = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = ParamId.parse(req.params)
			const row = await this.service.getById(id)
			if (!row) return res.status(404).json({ error: 'Вложение не найдено' })

		const rel = row.url_or_path.replace(/^\//,'')
		const abs = path.resolve(process.cwd(), rel)
		if (!fs.existsSync(abs)) return res.status(404).json({ error: 'Файл не найден на диске' })

		const rawName = row.file_name || path.basename(abs)
		const filename = tryFixMojibake(rawName)

		res.setHeader('Content-Disposition', contentDisposition(filename))
		res.setHeader('Content-Type', row.mime_type || mime.lookup(filename) || 'application/octet-stream')

		fs.createReadStream(abs).pipe(res)
		} catch (e) { 
			next(e) 
		}
	}
}
