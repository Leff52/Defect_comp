import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'users', schema: 'app' })
export class User {
	@PrimaryColumn('uuid') id!: string
	@Column('citext') email!: string // текст без учёта регистра
	@Column('text') password_hash!: string
	@Column('text') full_name!: string
	@Column('timestamptz') created_at!: Date
	@Column('timestamptz') updated_at!: Date
}
