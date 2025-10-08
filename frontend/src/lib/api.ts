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
	method: 'GET' | 'POST' = 'GET',
	body?: BodyInit | null,
	token?: string | null
): Promise<Blob> {
	const headers: Record<string, string> = {}
	const effectiveToken = token ?? getAuthToken()
	
	if (effectiveToken && effectiveToken !== 'undefined') {
		headers['Authorization'] = `Bearer ${effectiveToken}`
	}

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

export async function apiForm<T>(
	path: string,
	method: 'POST' | 'PUT' | 'PATCH' = 'POST',
	form: FormData,
	token?: string | null
): Promise<T> {
	const headers: Record<string, string> = {}
	const effectiveToken = token ?? getAuthToken()

	if (effectiveToken && effectiveToken !== 'undefined') {
		headers['Authorization'] = `Bearer ${effectiveToken}`
	} else {
		console.warn('[API-FORM] no token for', path)
	}

	console.log('[API-FORM] →', API + path, {
		hasToken: !!effectiveToken,
		peek: effectiveToken?.slice(0, 12),
		formData: true,
	})

	const res = await fetch(API + path, { 
		method, 
		headers, 
		body: form 
	})

	if (res.status === 401) throw new Error('Unauthorized')
	if (!res.ok) throw new Error(await safeText(res))
	return res.json() as Promise<T>
}

export async function apiBlobWithName(
	path: string,
	token?: string | null
): Promise<{ blob: Blob; filename?: string }> {
	const headers: Record<string, string> = {}
	const t = token ?? getAuthToken()
	if (t && t !== 'undefined') {
		headers['Authorization'] = `Bearer ${t}`
	}

	const res = await fetch(API + path, {
		method: 'GET',
		headers,
	})
	if (!res.ok) throw new Error(await safeText(res))

	const cd = res.headers.get('Content-Disposition') || ''
	const filename = parseFilenameFromCD(cd)
	const blob = await res.blob()
	return { blob, filename }
}

function parseFilenameFromCD(cd: string): string | undefined {
	const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd)
	if (star?.[1]) { 
		try { return decodeURIComponent(star[1]) } catch {} 
	}
	// filename="Файл.pdf"
	const quoted = /filename\s*=\s*"([^"]+)"/i.exec(cd)
	if (quoted?.[1]) return quoted[1]
	// filename=File.pdf
	const bare = /filename\s*=\s*([^;]+)/i.exec(cd)
	return bare?.[1]?.trim()
}

async function safeText(r: Response) {
	try {
		return await r.text()
	} catch {
		return 'Request failed'
	}
}

// Project API methods
export interface Project {
	id: string
	name: string
	customer: string | null
	created_at: string
	updated_at: string
}

export interface ProjectsResponse {
	items: Project[]
	total: number
	limit: number
	offset: number
}

export interface CreateProjectData {
	name: string
	customer?: string
}

export interface UpdateProjectData {
	name?: string
	customer?: string
}

export function getProjects(params: {
	page?: number
	limit?: number
	q?: string
}): Promise<ProjectsResponse> {
	const searchParams = new URLSearchParams()
	if (params.page) searchParams.set('page', params.page.toString())
	if (params.limit) searchParams.set('limit', params.limit.toString())
	if (params.q) searchParams.set('q', params.q)
	
	const query = searchParams.toString()
	return api<ProjectsResponse>(`/api/projects${query ? `?${query}` : ''}`)
}

export function getProjectsForSelect(): Promise<{ id: string; name: string }[]> {
	return api<{ id: string; name: string }[]>('/api/projects/select')
}

export function getProject(id: string): Promise<Project> {
	return api<Project>(`/api/projects/${id}`)
}

export function createProject(data: CreateProjectData): Promise<Project> {
	return api<Project>('/api/projects', 'POST', data)
}

export function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
	return api<Project>(`/api/projects/${id}`, 'PUT', data)
}

export function deleteProject(id: string): Promise<{ message: string }> {
	return api<{ message: string }>(`/api/projects/${id}`, 'DELETE')
}
