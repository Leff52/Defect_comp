import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'roles', schema: 'app' })
export class Role {
	@PrimaryColumn('uuid') id!: string
	@Column({
		type: 'enum', 
		enum: ['Engineer', 'Manager', 'Lead', 'Admin'],
		enumName: 'role_name_enum',
	})
	name!: 'Engineer' | 'Manager' | 'Lead' | 'Admin'
}
