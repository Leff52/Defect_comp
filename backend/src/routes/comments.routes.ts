import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { requireRole } from '../middlewares/requireRole'
import { CommentService } from '../services/CommentService'
import { CommentController } from '../controllers/CommentController'

const r = Router()
const svc = new CommentService()
const ctrl = new CommentController(svc)

r.get('/defects/:id/comments', authMiddleware, ctrl.listByDefect)
r.post('/defects/:id/comments', authMiddleware, ctrl.createForDefect)

r.delete(
	'/comments/:id',
	authMiddleware,
	requireRole('Manager', 'Lead', 'Admin'),
	ctrl.remove
)

export default r
