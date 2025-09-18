import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'

const r = Router()
const ctrl = new AuthController()

r.post('/auth/login', ctrl.login)

export default r
