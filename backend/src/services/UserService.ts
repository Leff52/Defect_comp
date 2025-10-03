import { User } from '../models/User'
import { In } from 'typeorm'
import { Role } from '../models/Role'
import { UserRole } from '../models/UserRole'
import { AppDataSource } from '../config/data-source'
import * as argon2 from 'argon2'

export class UserService {
	private users = AppDataSource.getRepository(User)
	private roles = AppDataSource.getRepository(Role)
	private userRoles = AppDataSource.getRepository(UserRole)

	async findByEmail(email: string) {
		return this.users.findOne({ where: { email } })
	}

	async getRolesForUser(userId: string): Promise<Array<Role['name']>> {
		// простой join через два запроса
		const Urs = await this.userRoles.find({ where: { user_id: userId } })
		if (Urs.length === 0) return []
		const roleIds = Urs.map(u => u.role_id)
		const rs = await this.roles.findBy({ id: In(roleIds) })
		return rs.map(r => r.name)
	}
	async getById(userId: string) {
		return this.users.findOne({ where: { id: userId } })
	}

	async updateEmail(id: string, email: string) {
		const row = await this.getById(id)
		if (!row) return null
		row.email = email
		return this.users.save(row)
	}

	async updatePassword(id: string, newPassword: string) {
		const row = await this.getById(id)
		if (!row) return null
		row.password_hash = await argon2.hash(newPassword)
		return this.users.save(row)
	}

	async verifyPassword(userId: string, plain: string) {
		const row = await this.getById(userId)
		if (!row || !row.password_hash) return false
		return argon2.verify(row.password_hash, plain)
	}

	async createUser(email: string, password: string, fullName: string, roleNames: string[]): Promise<User> {
		// Проверяем, существует ли уже пользователь с таким email
		const existingUser = await this.findByEmail(email)
		if (existingUser) {
			throw new Error('User with this email already exists')
		}

		// Создаем нового пользователя
		const passwordHash = await argon2.hash(password)
		const newUser = new User()
		newUser.id = require('crypto').randomUUID()
		newUser.email = email
		newUser.password_hash = passwordHash
		newUser.full_name = fullName
		newUser.created_at = new Date()
		newUser.updated_at = new Date()

		const savedUser = await this.users.save(newUser)

		// Получаем роли по именам
		const roles = await this.roles.find({
			where: roleNames.map(name => ({ name: name as any }))
		})

		// Создаем связи пользователь-роль
		for (const role of roles) {
			const userRole = new UserRole()
			userRole.user_id = savedUser.id
			userRole.role_id = role.id
			await this.userRoles.save(userRole)
		}

		return savedUser
	}

	async getAllUsers(): Promise<Array<User & { roles: string[] }>> {
		const users = await this.users.find()
		const usersWithRoles = []

		for (const user of users) {
			const roles = await this.getRolesForUser(user.id)
			usersWithRoles.push({
				...user,
				roles
			})
		}

		return usersWithRoles
	}

	async deleteUser(userId: string): Promise<boolean> {
		// Сначала удаляем связи пользователь-роль
		await this.userRoles.delete({ user_id: userId })
		
		// Затем удаляем пользователя
		const result = await this.users.delete({ id: userId })
		return (result.affected ?? 0) > 0
	}
}
