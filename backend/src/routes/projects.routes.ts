import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { ProjectService } from '../services/ProjectService'
import { ProjectController } from '../controllers/ProjectController'

const r = Router()
const svc = new ProjectService()
const ctrl = new ProjectController(svc)

r.get('/projects', authMiddleware, ctrl.list)
export default r
