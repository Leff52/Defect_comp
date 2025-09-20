import { User } from '../models/User'
import { In } from 'typeorm'
import { Role } from '../models/Role'
import { UserRole } from '../models/UserRole'
import { AppDataSource } from '../config/data-source'

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
}
