export class HttpError extends Error {
	status: number
	constructor(status: number, message: string) {
		super(message)
		this.status = status
	}
}
export const NotFound = (msg = 'Not found') => new HttpError(404, msg)
export const BadRequest = (msg = 'Bad request') => new HttpError(400, msg)
export const Unauthorized = (msg = 'Unauthorized') => new HttpError(401, msg)
export const Forbidden = (msg = 'Forbidden') => new HttpError(403, msg)
