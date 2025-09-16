import express from 'express'; 
import cors from 'cors';
import { config } from './config/config'; 
import { AppDataSource } from './config/data-source';
import { errorHandler } from './middlewares/errorHandler'; 
import health from './routes/health.routes'; 
import defects from './routes/defects.routes';
const app = express(); 
app.use(cors({ origin: ['http://localhost:3000'] }));
app.use(express.json());
app.use('/api', health); 
app.use('/api', defects); 
app.use(errorHandler);
AppDataSource.initialize().then(() => { app.listen(config.port, () => 
    console.log(`API on http://localhost:${config.port}`)); }).catch(err => 
        { 
            console.error('DB init error:', err); 
            process.exit(1);
        });
