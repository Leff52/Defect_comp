const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'


function getAuthToken(): string | null {
	return (
		localStorage.getItem('token') ||
		localStorage.getItem('authToken') || 
		localStorage.getItem('auth_token') || 
		null
	)
}

export async function api<T>(
	path: string,
	method: string = 'GET',
	body?: any,
	token?: string | null
): Promise<T> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' }

	const effectiveToken = token ?? getAuthToken()

	if (effectiveToken && effectiveToken !== 'undefined') {
		headers['Authorization'] = `Bearer ${effectiveToken}`
	} else {
		console.warn('[API] no token for', path)
	}

	console.log('[API] →', API + path, {
		hasToken: !!effectiveToken,
		peek: effectiveToken?.slice(0, 12),
	})

	const res = await fetch(API + path, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})

	if (res.status === 401) throw new Error('Unauthorized')
	if (!res.ok) throw new Error(await safeText(res))
	return (await res.json()) as T
}

export async function apiBlob(
	path: string,
	method: string = 'GET',
	body?: any,
	token?: string | null
): Promise<Blob> {
	const headers: Record<string, string> = {}
	if (token) headers['Authorization'] = `Bearer ${token}`

	const res = await fetch(API + path, {
		method,
		headers,
		body,
	})

	if (res.status === 401) {
		throw new Error('Unauthorized')
	}
	if (!res.ok) throw new Error(await safeText(res))
	return res.blob()
}

async function safeText(r: Response) {
	try {
		return await r.text()
	} catch {
		return 'Request failed'
	}
}
