import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'attachments', schema: 'app' })
export class Attachment {
	@PrimaryColumn('uuid') id!: string
	@Column('uuid') defect_id!: string
	@Column('uuid') author_id!: string
	@Column('text') file_name!: string
	@Column('text') mime_type!: string
	@Column('bigint') size_bytes!: string 
	@Column('text') url_or_path!: string 
	@Column('timestamptz') created_at!: Date
}
