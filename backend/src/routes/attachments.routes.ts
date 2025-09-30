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

/**
 * @openapi
 * /api/attachments/{id}/download:
 *   get:
 *     tags: [Attachments]
 *     summary: Download attachment file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Attachment or file not found
 *       401:
 *         description: Unauthorized
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
r.get('/attachments/:id/download', authMiddleware, ctrl.download)
r.delete('/attachments/:id', authMiddleware, ctrl.remove)

export default r
