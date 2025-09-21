import * as dotenv from 'dotenv'; // это библиотека для работы с .env файлами, вау

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || '4000', 10),
	dbUrl: process.env.DB_URL || '',
	jwtSecret: process.env.JWT_SECRET || 'changeme', 
	jwtExpires: process.env.JWT_EXPIRES || '1h', 
}
