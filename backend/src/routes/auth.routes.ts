import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middlewares/authMiddleware'

const r = Router()
const ctrl = new AuthController()

r.post('/auth/login', ctrl.login)
r.get('/auth/me', authMiddleware, ctrl.me)
export default r
