/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 */


import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middlewares/authMiddleware'

const r = Router()
const ctrl = new AuthController()

r.post('/auth/login', ctrl.login)
r.get('/auth/me', authMiddleware, ctrl.me)
export default r
