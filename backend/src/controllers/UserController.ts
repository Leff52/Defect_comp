import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { UserService } from '../services/UserService'

const CreateUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(4),
	fullName: z.string().min(1),
	roles: z.array(z.enum(['Engineer', 'Manager', 'Lead', 'Admin'])).min(1),
})

export class UserController {
	private userService = new UserService()

	createUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password, fullName, roles } = CreateUserSchema.parse(req.body)

			const currentUserRoles = (req as any).user?.roles || []
			const isAdmin = currentUserRoles.includes('Admin')
			const isLead = currentUserRoles.includes('Lead')

			if (!isAdmin && !isLead) {
				return res.status(403).json({ error: 'Only Admin and Lead can create users' })
			}

			// Lead не может создавать Admin или Lead роли
			if (!isAdmin && (roles.includes('Admin') || roles.includes('Lead'))) {
				return res.status(403).json({ error: 'Lead cannot create Admin or Lead users' })
			}

			if (roles.includes('Admin')) {
				return res.status(403).json({ error: 'Cannot create users with Admin role' })
			}

			const newUser = await this.userService.createUser(email, password, fullName, roles)
			const userRoles = await this.userService.getRolesForUser(newUser.id)

			res.status(201).json({
				user: {
					id: newUser.id,
					email: newUser.email,
					full_name: newUser.full_name,
					roles: userRoles,
					created_at: newUser.created_at,
				},
			})
		} catch (error) {
			if (error instanceof Error && error.message === 'User with this email already exists') {
				return res.status(400).json({ error: error.message })
			}
			next(error)
		}
	}

	getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const currentUserRoles = (req as any).user?.roles || []
			const isAdmin = currentUserRoles.includes('Admin')
			const isLead = currentUserRoles.includes('Lead')

			const users = await this.userService.getAllUsers()
			
			let filteredUsers = users
			if (isLead && !isAdmin) {
				filteredUsers = users.filter(user => !user.roles.includes('Admin'))
			}
			
			const safeUsers = filteredUsers.map(user => ({
				id: user.id,
				email: user.email,
				full_name: user.full_name,
				roles: user.roles,
				created_at: user.created_at,
				updated_at: user.updated_at,
			}))

			res.json({ users: safeUsers })
		} catch (error) {
			next(error)
		}
	}

	deleteUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const currentUserId = (req as any).user?.id
			const currentUserRoles = (req as any).user?.roles || []
			const isAdmin = currentUserRoles.includes('Admin')
			const isLead = currentUserRoles.includes('Lead')

			// Нельзя удалить самого себя
			if (id === currentUserId) {
				return res.status(400).json({ error: 'Cannot delete yourself' })
			}

			// Получаем данные удаляемого пользователя
			const userToDelete = await this.userService.getById(id)
			if (!userToDelete) {
				return res.status(404).json({ error: 'User not found' })
			}

			const userToDeleteRoles = await this.userService.getRolesForUser(id)

			// Lead не может удалять Admin
			if (isLead && !isAdmin && userToDeleteRoles.includes('Admin')) {
				return res.status(403).json({ error: 'Lead cannot delete Admin users' })
			}

			// Lead не может удалять других Lead
			if (isLead && !isAdmin && userToDeleteRoles.includes('Lead')) {
				return res.status(403).json({ error: 'Lead cannot delete other Lead users' })
			}

			// Никто не может удалять пользователей с ролью Admin
			if (userToDeleteRoles.includes('Admin')) {
				return res.status(403).json({ error: 'Cannot delete users with Admin role' })
			}

			const success = await this.userService.deleteUser(id)
			if (!success) {
				return res.status(404).json({ error: 'User not found' })
			}

			res.json({ message: 'User deleted successfully' })
		} catch (error) {
			next(error)
		}
	}
}