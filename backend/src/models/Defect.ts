import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';


@Entity({ name: 'defects', schema: 'app' })
export class Defect {

  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  project_id!: string;

  @Column('uuid', { nullable: true })
  stage_id!: string | null;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ['low', 'med', 'high', 'critical'],
    enumName: 'priority_enum',
  })
  priority!: 'low' | 'med' | 'high' | 'critical';

  @Column('uuid', { nullable: true })
  assignee_id!: string | null;

  @Column({
    type: 'enum',
    enum: ['new', 'in_work', 'review', 'closed', 'canceled'],
    enumName: 'status_enum',
  })
  status!: 'new' | 'in_work' | 'review' | 'closed' | 'canceled';

  @Column('date', { nullable: true })
  due_date!: string | null;

  @Column('timestamptz')
  created_at!: Date;

  @Column('timestamptz')
  updated_at!: Date;
}