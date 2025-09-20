import { Entity, PrimaryColumn, Column } from 'typeorm'
@Entity({ name: 'stages', schema: 'app' })
export class Stage {
	@PrimaryColumn('uuid') id!: string
	@Column('uuid') project_id!: string
	@Column('text') name!: string
	@Column('text') status!: string 
}
