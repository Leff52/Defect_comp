import { Router } from 'express'
import { AppDataSource } from '../config/data-source'
import { Defect } from '../models/Defect'
import { DefectService } from '../services/DefectService'
import { DefectController } from '../controllers/DefectController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { requireRole, requireRoleForStatus } from '../middlewares/requireRole'

const r = Router()
const repo = AppDataSource.getRepository(Defect)
const service = new DefectService(repo)
const ctrl = new DefectController(service)

r.get('/defects', authMiddleware, ctrl.list)
r.get('/defects/:id', authMiddleware, ctrl.getById)
r.post('/defects', authMiddleware, ctrl.create)
r.patch('/defects/:id', authMiddleware, ctrl.update)
r.delete('/defects/:id', authMiddleware, requireRole('Manager', 'Lead', 'Admin'), ctrl.remove)

r.patch('/defects/:id/status', authMiddleware, requireRoleForStatus(), ctrl.changeStatus)

export default r
