import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'

const svc = new UserService()

export class MeController {
	/**
	 * @openapi
	 * /api/me:
	 *   get:
	 *     tags: [Me]
	 *     summary: Get current user profile
	 *     responses:
	 *       200: { description: OK }
	 */
	me = async (req: Request, res: Response) => {
		res.json({ user: req.user })
	}

	/**
	 * @openapi
	 * /api/me/email:
	 *   patch:
	 *     tags: [Me]
	 *     summary: Change email (requires current password)
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required: [email, current_password]
	 *             properties:
	 *               email: { type: string, format: email }
	 *               current_password: { type: string, minLength: 2 }
	 *     responses:
	 *       200: { description: OK }
	 *       400: { description: Bad Request }
	 *       401: { description: Unauthorized }
	 *       409: { description: Email already in use }
	 */
	changeEmail = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, current_password } = z
				.object({
					email: z.string().email(),
					current_password: z.string().min(2),
				})
				.parse(req.body)

			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const ok = await svc.verifyPassword(userId, current_password)
			if (!ok) return res.status(400).json({ error: 'Wrong password' })

			const existing = await AppDataSource.getRepository('users')
				.createQueryBuilder('u')
				.where('LOWER(u.email) = LOWER(:email)', { email })
				.andWhere('u.id <> :id', { id: userId })
				.getOne()
			if (existing)
				return res.status(409).json({ error: 'Email already in use' })

			await svc.updateEmail(userId, email)
			return res.json({ ok: true })
		} catch (e) {
			next(e)
		}
	}

	/**
	 * @openapi
	 * /api/me/password:
	 *   patch:
	 *     tags: [Me]
	 *     summary: Change password
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required: [current_password, new_password]
	 *             properties:
	 *               current_password: { type: string, minLength: 2 }
	 *               new_password: { type: string, minLength: 8 }
	 *     responses:
	 *       200: { description: OK }
	 *       400: { description: Wrong password / validation error }
	 *       401: { description: Unauthorized }
	 */
	changePassword = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { current_password, new_password } = z
				.object({
					current_password: z.string().min(2),
					new_password: z.string().min(8),
				})
				.parse(req.body)

			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const ok = await svc.verifyPassword(userId, current_password)
			if (!ok) return res.status(400).json({ error: 'Wrong password' })

			await svc.updatePassword(userId, new_password)
			return res.json({ ok: true })
		} catch (e) {
			next(e)
		}
	}
}
