const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export async function api<T = any>(
	path: string,
	method: HttpMethod = 'GET',
	body?: any,
	token?: string,
	extraHeaders?: Record<string, string>
): Promise<T> {
	const headers: Record<string, string> = { ...extraHeaders }
	if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json'
	if (token) headers['Authorization'] = `Bearer ${token}`

	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body:
			body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
		cache: 'no-store',
	})

	if (!res.ok) {
		let detail: any = undefined
		try {
			detail = await res.json()
		} catch {}
		throw new Error(detail?.error || res.statusText)
	}
	return (await res.json()) as T
}

export async function apiBlob(path: string, token?: string): Promise<Blob> {
	const res = await fetch(`${API}${path}`, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
	})
	if (!res.ok) throw new Error(res.statusText)
	return await res.blob()
}
