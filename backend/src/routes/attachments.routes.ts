/**
 * @openapi
 * /api/defects/{id}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: List attachments for defect
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
 */
/**
 * @openapi
 * /api/defects/{id}/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload attachment (multipart/form-data)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Created }
 */

import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { AttachmentService } from '../services/AttachmentService'
import { AttachmentController } from '../controllers/AttachmentController'
import { uploader } from '../utils/upload'

const r = Router()
const svc = new AttachmentService()
const ctrl = new AttachmentController(svc)

r.get('/defects/:id/attachments', authMiddleware, ctrl.listByDefect)
r.post(
	'/defects/:id/attachments',
	authMiddleware,
	uploader.single('file'),
	ctrl.uploadForDefect
)
r.delete('/attachments/:id', authMiddleware, ctrl.remove)

export default r
