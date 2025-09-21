import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AttachmentService } from '../services/AttachmentService'
import { getPublicUrl } from '../utils/upload'

const ParamDefect = z.object({ id: z.string().uuid() })
const ParamId = z.object({ id: z.string().uuid() })

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
			const { id } = ParamId.parse(req.params)
			const user = req.user
			if (!user) return res.status(401).json({ error: 'Unauthorized' })

			const row = await this.service.getById(id)
			const canModerate =
				user.roles?.some(r => ['Manager', 'Lead', 'Admin'].includes(r)) ?? false
			if (row.author_id !== user.id && !canModerate) {
				return res.status(403).json({ error: 'Forbidden' })
			}
			res.json(await this.service.remove(id))
		} catch (e) {
			next(e)
		}
	}
}
