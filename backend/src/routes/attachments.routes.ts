import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { AttachmentService } from '../services/AttachmentService'
import { AttachmentController } from '../controllers/AttachmentController'
import { uploader } from '../utils/upload'

const r = Router()
const svc = new AttachmentService()
const ctrl = new AttachmentController(svc)

r.get('/defects/:id/attachments', authMiddleware, ctrl.listByDefect)
r.post(
	'/defects/:id/attachments',
	authMiddleware,
	uploader.single('file'),
	ctrl.uploadForDefect
)
r.delete('/attachments/:id', authMiddleware, ctrl.remove)

export default r
