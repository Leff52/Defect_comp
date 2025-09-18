import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'user_roles', schema: 'app' })
export class UserRole {
	@PrimaryColumn('uuid') user_id!: string
	@PrimaryColumn('uuid') role_id!: string
}
// это связь многие ко многим между пользователями и ролями
// один пользователь может иметь несколько ролей