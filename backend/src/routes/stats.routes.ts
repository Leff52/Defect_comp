import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { StatsController } from '../controllers/StatsController'

const r = Router()
const ctrl = new StatsController()

r.get('/stats/summary', authMiddleware, ctrl.summary)
r.get('/stats/status-distribution', authMiddleware, ctrl.statusDistribution)
r.get('/stats/trend', authMiddleware, ctrl.trend)
r.get('/stats/by-project', authMiddleware, ctrl.byProject)
r.get('/stats/aging', authMiddleware, ctrl.aging)
r.get('/stats/leadtime', authMiddleware, ctrl.leadtime)

export default r
