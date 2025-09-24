import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { ProjectService } from '../services/ProjectService'
import { ProjectController } from '../controllers/ProjectController'

const r = Router()
const svc = new ProjectService()
const ctrl = new ProjectController(svc)

/**
 * @swagger
 * tags: [Projects]
 * /api/projects:
 *   get:
 *     summary: List projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:   { type: string, format: uuid }
 *                   name: { type: string }
 */

r.get('/projects', authMiddleware, ctrl.list)
export default r
