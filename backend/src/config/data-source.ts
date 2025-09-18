import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config';
import { Defect } from '../models/Defect';
//import { Project } from '../models/Project'
import { User } from '../models/User'
import { Role } from '../models/Role'
import { UserRole } from '../models/UserRole'

export const AppDataSource = new DataSource({
	type: 'postgres',
	url: config.dbUrl,
	schema: 'app',
	entities: [Defect, User, Role, UserRole /*, Project*/],
	synchronize: false,
	logging: false,
})