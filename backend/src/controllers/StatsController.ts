import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppDataSource } from '../config/data-source'

// общий парсер фильтров
const Q = z.object({
	project_id: z.string().uuid().optional(),
	assignee_id: z.string().uuid().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
})

export class StatsController {
	/**
	 * @openapi
	 * /api/stats/summary:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Summary KPIs for defects within period
	 *     parameters:
	 *       - in: query
	 *         name: project_id
	 *         schema: { type: string, format: uuid }
	 *       - in: query
	 *         name: assignee_id
	 *         schema: { type: string, format: uuid }
	 *       - in: query
	 *         name: from
	 *         schema: { type: string, format: date }
	 *       - in: query
	 *         name: to
	 *         schema: { type: string, format: date }
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	summary = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = Q.parse(req.query)
			const params: any[] = []
			const where: string[] = []
			let idx = 1

			if (q.project_id) { where.push(`d.project_id = $${idx++}`); params.push(q.project_id) }
			if (q.assignee_id) { where.push(`d.assignee_id = $${idx++}`); params.push(q.assignee_id) }
			if (q.from) { where.push(`d.created_at >= $${idx++}`); params.push(q.from) }
			if (q.to) { where.push(`d.created_at < ($${idx++}::date + interval '1 day')`); params.push(q.to) }

			const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

			const [row] = await AppDataSource.query(`
				SELECT
					COUNT(*)::int AS created,
					COUNT(*) FILTER (WHERE d.status='closed')::int AS closed_in_period
				FROM app.defects d
				${whereSql}
			`, params)

			// открыто сейчас
			const paramsOpen: any[] = []
			const whereOpen: string[] = [`d.status NOT IN ('closed','canceled')`]
			let idxOpen = 1
			if (q.project_id) { whereOpen.push(`d.project_id = $${idxOpen++}`); paramsOpen.push(q.project_id) }
			if (q.assignee_id) { whereOpen.push(`d.assignee_id = $${idxOpen++}`); paramsOpen.push(q.assignee_id) }

			const [openNow] = await AppDataSource.query(`
				SELECT COUNT(*)::int AS open_now
				FROM app.defects d
				WHERE ${whereOpen.join(' AND ')}
			`, paramsOpen)

			// средний lead time для закрытых
			const whereLt = whereSql ? whereSql + " AND d.status='closed'" : "WHERE d.status='closed'"
			const [lt] = await AppDataSource.query(`
				SELECT
					AVG(EXTRACT(EPOCH FROM (d.updated_at - d.created_at))) AS avg_lead_time_sec
				FROM app.defects d
				${whereLt}
			`, params)

			return res.json({
				created: Number(row?.created || 0),
				closed_in_period: Number(row?.closed_in_period || 0),
				open_now: Number(openNow?.open_now || 0),
				avg_lead_time_sec: lt?.avg_lead_time_sec ? Number(lt.avg_lead_time_sec) : null,
				close_rate: row?.created ? Number(row.closed_in_period || 0) / Number(row.created) : null,
			})
		} catch (e) { next(e) }
	}

	/**
	 * @openapi
	 * /api/stats/status-distribution:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Current distribution by status
	 *     parameters:
	 *       - in: query
	 *         name: project_id
	 *         schema: { type: string, format: uuid }
	 *       - in: query
	 *         name: assignee_id
	 *         schema: { type: string, format: uuid }
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	statusDistribution = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = Q.pick({ project_id: true, assignee_id: true }).parse(req.query)
			const params: any[] = []
			const where: string[] = []
			let idx = 1
			if (q.project_id) { where.push(`d.project_id = $${idx++}`); params.push(q.project_id) }
			if (q.assignee_id) { where.push(`d.assignee_id = $${idx++}`); params.push(q.assignee_id) }
			const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

			const rows = await AppDataSource.query(`
				SELECT d.status, COUNT(*)::int AS count
				FROM app.defects d
				${whereSql}
				GROUP BY d.status
			`, params)
			res.json(rows)
		} catch (e) { next(e) }
	}

	/**
	 * @openapi
	 * /api/stats/trend:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Created vs Closed by day
	 *     parameters:
	 *       - in: query
	 *         name: days
	 *         schema: { type: integer, default: 30 }
	 *       - in: query
	 *         name: project_id
	 *         schema: { type: string, format: uuid }
	 *       - in: query
	 *         name: assignee_id
	 *         schema: { type: string, format: uuid }
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	trend = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const base = Q.extend({ days: z.coerce.number().int().min(1).max(365).default(30) }).parse(req.query)
			const params: any[] = [base.days]
			let idx = 2
			const filters: string[] = []
			if (base.project_id) { filters.push(`d.project_id = $${idx++}`); params.push(base.project_id) }
			if (base.assignee_id) { filters.push(`d.assignee_id = $${idx++}`); params.push(base.assignee_id) }
			const whereCreated = filters.length ? 'AND ' + filters.join(' AND ') : ''
			const whereClosed  = whereCreated

			const rows = await AppDataSource.query(`
				WITH days AS (
					SELECT generate_series((CURRENT_DATE - ($1||' day')::interval)::date, CURRENT_DATE, '1 day')::date AS day
				),
				created AS (
					SELECT created_at::date AS day, COUNT(*)::int AS cnt
					FROM app.defects d
					WHERE created_at >= CURRENT_DATE - ($1||' day')::interval
					${whereCreated}
					GROUP BY created_at::date
				),
				closed AS (
					SELECT updated_at::date AS day, COUNT(*)::int AS cnt
					FROM app.defects d
					WHERE d.status='closed' AND updated_at >= CURRENT_DATE - ($1||' day')::interval
					${whereClosed}
					GROUP BY updated_at::date
				)
				SELECT
					days.day::text,
					COALESCE(created.cnt,0)::int AS created,
					COALESCE(closed.cnt,0)::int  AS closed
				FROM days
				LEFT JOIN created ON created.day = days.day
				LEFT JOIN closed  ON closed.day  = days.day
				ORDER BY days.day ASC
			`, params)
			res.json(rows)
		} catch (e) { next(e) }
	}

	/**
	 * @openapi
	 * /api/stats/by-project:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Totals by project
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	byProject = async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const rows = await AppDataSource.query(`
				SELECT p.id, p.name,
					COUNT(d.*)::int AS total,
					COUNT(d.*) FILTER (WHERE d.status='closed')::int AS closed
				FROM app.projects p
				LEFT JOIN app.defects d ON d.project_id = p.id
				GROUP BY p.id, p.name
				ORDER BY total DESC
			`)
			res.json(rows)
		} catch (e) { next(e) }
	}

	/**
	 * @openapi
	 * /api/stats/aging:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Aging buckets for open defects
	 *     parameters:
	 *       - in: query
	 *         name: project_id
	 *         schema: { type: string, format: uuid }
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	aging = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = Q.pick({ project_id: true }).parse(req.query)
			const params: any[] = []
			const where: string[] = [`d.status NOT IN ('closed','canceled')`]
			let idx = 1
			if (q.project_id) { where.push(`d.project_id = $${idx++}`); params.push(q.project_id) }
			const whereSql = 'WHERE ' + where.join(' AND ')

			const rows = await AppDataSource.query(`
				SELECT
					SUM(CASE WHEN CURRENT_DATE - d.created_at::date <= 2  THEN 1 ELSE 0 END)::int AS b0_2,
					SUM(CASE WHEN CURRENT_DATE - d.created_at::date BETWEEN 3 AND 7 THEN 1 ELSE 0 END)::int AS b3_7,
					SUM(CASE WHEN CURRENT_DATE - d.created_at::date BETWEEN 8 AND 14 THEN 1 ELSE 0 END)::int AS b8_14,
					SUM(CASE WHEN CURRENT_DATE - d.created_at::date >= 15 THEN 1 ELSE 0 END)::int AS b15p
				FROM app.defects d
				${whereSql}
			`, params)
			res.json(rows[0] || { b0_2:0,b3_7:0,b8_14:0,b15p:0 })
		} catch (e) { next(e) }
	}

	/**
	 * @openapi
	 * /api/stats/leadtime:
	 *   get:
	 *     tags: [Stats]
	 *     summary: Lead time percentiles for closed defects
	 *     parameters:
	 *       - in: query
	 *         name: project_id
	 *         schema: { type: string, format: uuid }
	 *       - in: query
	 *         name: from
	 *         schema: { type: string, format: date }
	 *       - in: query
	 *         name: to
	 *         schema: { type: string, format: date }
	 *     responses:
	 *       200:
	 *         description: OK
	 */
	leadtime = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = Q.parse(req.query)
			const params: any[] = []
			const where: string[] = [`d.status='closed'`]
			let idx = 1
			if (q.project_id) { where.push(`d.project_id = $${idx++}`); params.push(q.project_id) }
			if (q.from) { where.push(`d.updated_at >= $${idx++}`); params.push(q.from) }
			if (q.to) { where.push(`d.updated_at < ($${idx++}::date + interval '1 day')`); params.push(q.to) }

			const whereSql = 'WHERE ' + where.join(' AND ')
			const [row] = await AppDataSource.query(`
				SELECT
					PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (d.updated_at - d.created_at))) AS p50,
					PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (d.updated_at - d.created_at))) AS p75,
					PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (d.updated_at - d.created_at))) AS p90
				FROM app.defects d
				${whereSql}
			`, params)
			res.json({
				p50: row?.p50 ? Number(row.p50) : null,
				p75: row?.p75 ? Number(row.p75) : null,
				p90: row?.p90 ? Number(row.p90) : null,
			})
		} catch (e) { next(e) }
	}
}
