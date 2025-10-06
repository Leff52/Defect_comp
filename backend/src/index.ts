import express from 'express'; 
import cors from 'cors';
import path from 'path'
import me from './routes/me.routes'
import { config } from './config/config'; 
import { AppDataSource } from './config/data-source';
import { errorHandler } from './middlewares/errorHandler'; 
import health from './routes/health.routes'; 
import defects from './routes/defects.routes';
import auth from './routes/auth.routes'
import projects from './routes/projects.routes'
import stages from './routes/stages.routes'
import comments from './routes/comments.routes'
import attachments from './routes/attachments.routes'
import users from './routes/users.routes'
import stats from './routes/stats.routes'
import { setupSwagger } from './config/swagger'


const app = express(); 

app.use(cors({ origin: 'http://localhost:3000', credentials: false }))
app.use(express.json());
app.use('/api', me)
app.use('/api', health); 
app.use('/api', defects); 
AppDataSource.initialize().then(() => { app.listen(config.port, () => 
    console.log(`API on http://localhost:${config.port}`)); }).catch(err => 
        { 
            console.error('DB init error:', err); 
            process.exit(1);
        });
app.use('/api', auth)
app.use('/api', projects)
app.use('/api', stages)
app.use('/api', comments)
app.use('/api', users)
app.use('/api', stats)
app.use(
	'/files',
	express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads'))
)
app.use('/api', attachments)
app.use(errorHandler)   
setupSwagger(app);