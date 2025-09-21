
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

r.get(
	'/defects/export.csv',
	authMiddleware,
	requireRole('Manager', 'Lead', 'Admin'),
	ctrl.exportCsv
)
r.get(
	'/defects/export.xlsx',
	authMiddleware,
	requireRole('Manager', 'Lead', 'Admin'),
	ctrl.exportXlsx
)

r.get('/defects', authMiddleware, ctrl.list)
r.get('/defects/:id', authMiddleware, ctrl.getById)
r.post('/defects', authMiddleware, ctrl.create)
r.patch('/defects/:id', authMiddleware, ctrl.update)
r.delete(
	'/defects/:id',
	authMiddleware,
	requireRole('Manager', 'Lead', 'Admin'),
	ctrl.remove
)

r.patch(
	'/defects/:id/status',
	authMiddleware,
	requireRoleForStatus(),
	ctrl.changeStatus
)


/**
 * @openapi
 * /api/defects/export.csv:
 *   get:
 *     tags: [Defects]
 *     summary: Export defects to CSV (filtered)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [new,in_work,review,closed,canceled] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low,med,high,critical] }
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: assigneeId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: created_at:desc }
 *     responses:
 *       200: { description: CSV file }
 */

/**
 * @openapi
 * /api/defects/export.xlsx:
 *   get:
 *     tags: [Defects]
 *     summary: Export defects to Excel (filtered)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [new,in_work,review,closed,canceled] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low,med,high,critical] }
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: assigneeId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: created_at:desc }
 *     responses:
 *       200: { description: Excel file }
 */


/**
 * @openapi
 * /api/defects:
 *   get:
 *     tags: [Defects]
 *     summary: List defects
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new,in_work,review,closed,canceled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low,med,high,critical]
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "created_at:desc"
 *     responses:
 *       200:
 *         description: Page of defects
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PageResult'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Defect' }
 */

/**
 * @openapi
 * /api/defects/{id}:
 *   get:
 *     tags: [Defects]
 *     summary: Get defect by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Defect'
 */

/**
 * @openapi
 * /api/defects/{id}/status:
 *   patch:
 *     tags: [Defects]
 *     summary: Change defect status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [new,in_work,review,closed,canceled] }
 *     responses:
 *       200: { description: OK }
 */

export default r
