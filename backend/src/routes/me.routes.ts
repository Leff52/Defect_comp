import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { MeController } from '../controllers/MeController'

const r = Router()
const ctrl = new MeController()

r.get('/me', authMiddleware, ctrl.me)
r.patch('/me/email', authMiddleware, ctrl.changeEmail)
r.patch('/me/password', authMiddleware, ctrl.changePassword)

export default r
