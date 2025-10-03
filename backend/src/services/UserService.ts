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
}
