import { Entity, PrimaryColumn, Column } from 'typeorm'
@Entity({ name: 'comments', schema: 'app' })
export class Comment {
	@PrimaryColumn('uuid') id!: string
	@Column('uuid') defect_id!: string
	@Column('uuid') author_id!: string
	@Column('text') text!: string
	@Column('timestamptz') created_at!: Date
}
