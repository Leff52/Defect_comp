import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config';
import { Defect } from '../models/Defect';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.dbUrl,
  schema: 'app',
  entities: [Defect],
  synchronize: false,
  logging: false,
});