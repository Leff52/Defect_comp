import { api } from './api'

export async function getMe(token?: string | null) {
	return api<{
		user: { id: string; email: string; full_name?: string; roles: string[] }
	}>('/api/me', 'GET', undefined, token)
}
export async function changeEmail(
	payload: { email: string; current_password: string },
	token?: string | null
) {
	return api<{ ok: true }>('/api/me/email', 'PATCH', payload, token)
}
export async function changePassword(
	payload: { current_password: string; new_password: string },
	token?: string | null
) {
	return api<{ ok: true }>('/api/me/password', 'PATCH', payload, token)
}
