import { Router } from 'express'
const r = Router()
r.get('/health', (_req, res) => res.json({ ok: true }))
export default r
// это просто роут для проверки что сервер живой, вау