import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { UserService } from '../services/UserService'
import { AuthService } from '../services/AuthService'
import argon2 from 'argon2'

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(4),
})

export class AuthController {
	private users = new UserService()

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = LoginSchema.parse(req.body)

			const user = await this.users.findByEmail(email)
			if (!user) return res.status(401).json({ error: 'Invalid credentials' })

			const ok = await argon2.verify(user.password_hash, password)
			if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

			const roles = await this.users.getRolesForUser(user.id)
			const token = AuthService.sign({ id: user.id, roles })

			res.json({
				token,
				user: {
					id: user.id,
					email: user.email,
					full_name: user.full_name,
					roles,
				},
			})
		} catch (e) {
			next(e)
		}
	}
}