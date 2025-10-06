'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/store/auth'
import AuthGuard from '@/components/AuthGuard'
import { fetchSummary, fetchStatusDist, fetchTrend, fetchByProject, fetchAging } from '@/lib/stats'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

// Функция для перевода статусов
function getStatusLabel(status: string): string {
	const labels: Record<string, string> = {
		'open': 'Открыт',
		'in_work': 'В работе',
		'in_review': 'На проверке',
		'closed': 'Закрыт',
		'canceled': 'Отменён',
	}
	return labels[status] || status
}

export default function StatsPage() {
	const { token } = useAuth()
	const [summary, setSummary] = useState<any>(null)
	const [dist, setDist] = useState<any[]>([])
	const [trend, setTrend] = useState<any[]>([])
	const [byProject, setByProject] = useState<any[]>([])
	const [aging, setAging] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	// фильтры
	const qs = '' 

	useEffect(() => {
		if (!token) return
		setLoading(true)
		Promise.all([
			fetchSummary(qs, token).then((r) => setSummary(r as any)),
			fetchStatusDist(qs, token).then((r) => setDist(r as any[])),
			fetchTrend(qs, token).then((r) => setTrend(r as any[])),
			fetchByProject(token).then((r) => setByProject(r as any[])),
			fetchAging(qs, token).then((r) => setAging(r as any)),
		])
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [token])

	if (loading) {
		return (
			<AuthGuard>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<div className="text-lg text-gray-600">Загрузка статистики...</div>
					</div>
				</div>
			</AuthGuard>
		)
	}

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-7xl mx-auto space-y-6">
					<h1 className="text-3xl font-bold text-gray-900">Статистика дефектов</h1>

					{/* Сводка KPI */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Kpi title="Создано" value={summary?.created ?? '—'} color="blue" />
						<Kpi title="Закрыто" value={summary?.closed_in_period ?? '—'} color="green" />
						<Kpi title="Открыто сейчас" value={summary?.open_now ?? '—'} color="orange" />
						<Kpi 
							title="Avg Lead Time" 
							value={summary?.avg_lead_time_sec ? humanSec(summary.avg_lead_time_sec) : '—'} 
							color="purple"
						/>
					</div>

					{/* Создано vs Закрыто */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Создано и Закрыто (последние 30 дней)</h2>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={trend}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="day" tick={{ fill: '#4b5563' }} />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Legend />
								<Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Создано" />
								<Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} name="Закрыто" />
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Распределение по статусам */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">Распределение по статусам</h2>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie 
										data={dist.map(d => ({ ...d, statusLabel: getStatusLabel(d.status) }))} 
										dataKey="count" 
										nameKey="statusLabel" 
										cx="50%" 
										cy="50%" 
										outerRadius={100} 
										label={(entry) => `${entry.statusLabel}: ${entry.count}`}
									>
										{dist.map((_, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{/* Старение открытых */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">Старение открытых дефектов</h2>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart
									data={[
										{ bucket: '0–2 дня', value: aging?.b0_2 ?? 0 },
										{ bucket: '3–7 дней', value: aging?.b3_7 ?? 0 },
										{ bucket: '8–14 дней', value: aging?.b8_14 ?? 0 },
										{ bucket: '15+ дней', value: aging?.b15p ?? 0 },
									]}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="bucket" />
									<YAxis allowDecimals={false} />
									<Tooltip />
									<Bar dataKey="value" fill="#f59e0b" name="Количество" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* По проектам */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Дефекты по проектам</h2>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={byProject}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Legend />
								<Bar dataKey="total" fill="#3b82f6" name="Всего" />
								<Bar dataKey="closed" fill="#10b981" name="Закрыто" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</AuthGuard>
	)
}

function Kpi({ title, value, color }: { title: string; value: any; color: string }) {
	const colorClasses = {
		blue: 'bg-blue-50 border-blue-200',
		green: 'bg-green-50 border-green-200',
		orange: 'bg-orange-50 border-orange-200',
		purple: 'bg-purple-50 border-purple-200',
	}

	const textColors = {
		blue: 'text-blue-900',
		green: 'text-green-900',
		orange: 'text-orange-900',
		purple: 'text-purple-900',
	}

	return (
		<div className={`rounded-xl border-2 p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
			<div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
			<div className={`text-3xl font-bold ${textColors[color as keyof typeof textColors]}`}>{value}</div>
		</div>
	)
}

function humanSec(sec: number) {
	const s = Math.round(sec)
	const d = Math.floor(s / 86400)
	const h = Math.floor((s % 86400) / 3600)
	const m = Math.floor((s % 3600) / 60)
	if (d > 0) return `${d}д ${h}ч`
	if (h > 0) return `${h}ч ${m}м`
	return `${m}м`
}
