import { api } from './api'

export function fetchSummary(qs = '', token?: string | null) {
	return api(`/api/stats/summary${qs}`, 'GET', undefined, token)
}

export function fetchStatusDist(qs = '', token?: string | null) {
	return api(`/api/stats/status-distribution${qs}`, 'GET', undefined, token)
}

export function fetchTrend(qs = '', token?: string | null) {
	return api(`/api/stats/trend${qs}`, 'GET', undefined, token)
}

export function fetchByProject(token?: string | null) {
	return api(`/api/stats/by-project`, 'GET', undefined, token)
}

export function fetchAging(qs = '', token?: string | null) {
	return api(`/api/stats/aging${qs}`, 'GET', undefined, token)
}

export function fetchLeadtime(qs = '', token?: string | null) {
	return api(`/api/stats/leadtime${qs}`, 'GET', undefined, token)
}
