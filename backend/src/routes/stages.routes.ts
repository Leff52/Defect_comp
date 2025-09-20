import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { StageService } from '../services/StageService'
import { StageController } from '../controllers/StageController'

const r = Router()
const svc = new StageService()
const ctrl = new StageController(svc)

r.get('/stages', authMiddleware, ctrl.list) 
export default r
