
import { Request } from 'express'

export type PageParams = { limit: number; offset: number }
export function getPage(
	req: Request,
	def: PageParams = { limit: 20, offset: 0 }
): PageParams {
	const limit = Math.min(
		Math.max(
			parseInt(String(req.query.limit ?? def.limit), 10) || def.limit,
			1
		),
		100
	)
	const offset = Math.max(
		parseInt(String(req.query.offset ?? def.offset), 10) || def.offset,
		0
	)
	return { limit, offset }
}

export function toPage<T>(items: T[], total: number) {
	return { items, total }
}
