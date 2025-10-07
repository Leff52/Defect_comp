import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config';
import { Defect } from '../models/Defect';
import { User } from '../models/User'
import { Role } from '../models/Role'
import { UserRole } from '../models/UserRole'
import { Project } from '../models/Project'
import { Stage } from '../models/Stage'
import { Comment } from '../models/Comment'
import { Attachment } from '../models/Attachment'

export const AppDataSource = new DataSource({
	type: 'postgres',
	url: config.dbUrl,
	schema: 'app',
	entities: [Defect, User, Role, UserRole, Project, Stage, Comment, Attachment],
	synchronize: process.env.DB_SYNC === 'true',
	logging: false,
})
