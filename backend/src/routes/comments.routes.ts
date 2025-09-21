/**
 * @openapi
 * /api/defects/{id}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List comments for defect
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PageResult'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Comment' }
 */
/**
 * @openapi
 * /api/defects/{id}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create comment
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
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */

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
