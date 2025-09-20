import { Entity, PrimaryColumn, Column } from 'typeorm'
@Entity({ name: 'projects', schema: 'app' })
export class Project {
	@PrimaryColumn('uuid') id!: string
	@Column('text') name!: string
	@Column('text', { nullable: true }) customer!: string | null
	@Column('timestamptz') created_at!: Date
	@Column('timestamptz') updated_at!: Date
}
