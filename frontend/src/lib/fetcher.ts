const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE}${url}`, options)
	
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
		throw new Error(errorData.error || `HTTP ${response.status}`)
	}
	
	return response.json()
}