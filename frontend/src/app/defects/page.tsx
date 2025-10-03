'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/store/auth'
import { api, apiBlob } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import { CreateDefectDialog } from '@/components/CreateDefectDialog'
import { useToast } from '@/components/Toast'

type Defect = {
	id: string
	title: string
	status: string
	priority: string
	project_id: string
	assignee_id?: string | null
	created_at: string
}

const STATUS = ['new', 'in_work', 'review', 'closed', 'canceled'] as const
const PRIOR = ['low', 'med', 'high', 'critical'] as const
const SORTS = [
	'created_at:desc',
	'created_at:asc',
	'due_date:asc',
	'due_date:desc',
] as const

const statusLabels = {
	new: 'Новый',
	in_work: 'В работе',
	review: 'На проверке',
	closed: 'Закрыт',
	canceled: 'Отменён'
}

const priorityLabels = {
	low: 'Низкий',
	med: 'Средний',
	high: 'Высокий',
	critical: 'Критический'
}

const sortLabels = {
	'created_at:desc': 'Новые первыми',
	'created_at:asc': 'Старые первыми',
	'due_date:asc': 'По сроку ↑',
	'due_date:desc': 'По сроку ↓'
}

export default function DefectsPage() {
	const { token, hydrated, user } = useAuth()
	const { show: showToast, Toast } = useToast()
	const [rows, setRows] = useState<Defect[]>([])
	const [total, setTotal] = useState(0)
	const [openCreate, setOpenCreate] = useState(false)

	const [q, setQ] = useState('')
	const [status, setStatus] = useState<string>('')
	const [priority, setPriority] = useState<string>('')
	const [sort, setSort] = useState<string>('created_at:desc')
	const canExportData = () => {
		if (!user?.roles) return false
		return !user.roles.includes('Engineer')
	}

	const query = useMemo(() => {
		const p = new URLSearchParams()
		if (q) p.set('q', q)
		if (status) p.set('status', status)
		if (priority) p.set('priority', priority)
		if (sort) p.set('sort', sort)
		p.set('limit', '50')
		return p.toString()
	}, [q, status, priority, sort])

	useEffect(() => {
		if (!token || !hydrated) return
		api<{ items: Defect[]; total: number }>(
			`/api/defects?${query}`,
			'GET',
			undefined,
			token
		)
			.then(d => {
				setRows(d.items)
				setTotal(d.total)
			})
			.catch(console.error)
	}, [token, query])

	const download = async (fmt: 'csv' | 'xlsx') => {
		if (!token) return
		if (!canExportData()) {
			showToast('У вас нет прав для экспорта данных', 'error')
			return
		}
		
		const blob = await apiBlob(`/api/defects/export.${fmt}?${query}`, 'GET', undefined, token)
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `defects_${Date.now()}.${fmt}`
		document.body.appendChild(a)
		a.click()
		a.remove()
		URL.revokeObjectURL(url)
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'critical': return 'bg-red-100 text-red-800'
			case 'high': return 'bg-orange-100 text-orange-800'
			case 'med': return 'bg-yellow-100 text-yellow-800'
			case 'low': return 'bg-green-100 text-green-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'new': return 'bg-blue-100 text-blue-800'
			case 'in_work': return 'bg-indigo-100 text-indigo-800'
			case 'review': return 'bg-purple-100 text-purple-800'
			case 'closed': return 'bg-green-100 text-green-800'
			case 'canceled': return 'bg-gray-100 text-gray-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<AuthGuard>
			<div className='max-w-7xl mx-auto p-6 space-y-6'>
				<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
					<h1 className='text-3xl font-bold text-gray-500'>Дефекты</h1>

					<div className='flex flex-wrap gap-3'>
						<input
							value={q}
							onChange={e => setQ(e.target.value)}
							placeholder='Поиск по названию...'
							className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>

						<select
							value={status}
							onChange={e => setStatus(e.target.value)}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						>
							<option value=''>Все статусы</option>
							{STATUS.map(s => (
								<option key={s} value={s} className='text-gray-600'>
									{statusLabels[s]}
								</option>
							))}
						</select>

						<select
							value={priority}
							onChange={e => setPriority(e.target.value)}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						>
							<option value=''>Любой приоритет</option>
							{PRIOR.map(p => (
								<option key={p} value={p} className='text-gray-600'>
									{priorityLabels[p]}
								</option>
							))}
						</select>

						<select
							value={sort}
							onChange={e => setSort(e.target.value)}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						>
							{SORTS.map(s => (
								<option key={s} value={s} className='text-gray-600'>
									{sortLabels[s]}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='flex flex-wrap gap-3'>
					<button
						onClick={() => setOpenCreate(true)}
						className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition'
					>
						+ Создать дефект
					</button>
					<button
						onClick={() => download('csv')}
						disabled={!canExportData()}
						className={`px-4 py-2 rounded-lg font-medium transition ${
							canExportData()
								? 'bg-gray-600 hover:bg-gray-700 text-white'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
						title={!canExportData() ? 'У вас нет прав для экспорта данных' : ''}
					>
						Экспорт CSV
					</button>
					<button
						onClick={() => download('xlsx')}
						disabled={!canExportData()}
						className={`px-4 py-2 rounded-lg font-medium transition ${
							canExportData()
								? 'bg-green-600 hover:bg-green-700 text-white'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
						title={!canExportData() ? 'У вас нет прав для экспорта данных' : ''}
					>
						Экспорт Excel
					</button>
				</div>

				<div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
										Название
									</th>
									<th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
										Статус
									</th>
									<th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
										Приоритет
									</th>
									<th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
										Создан
									</th>
									<th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
										Действия
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{rows.map(d => (
									<tr key={d.id} className='hover:bg-gray-50 transition'>
										<td className='px-6 py-4'>
											<div className='text-sm font-medium text-gray-900'>
												{d.title}
											</div>
										</td>
										<td className='px-6 py-4 text-center'>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
													d.status
												)}`}
											>
												{statusLabels[d.status as keyof typeof statusLabels] ||
													d.status}
											</span>
										</td>
										<td className='px-6 py-4 text-center'>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
													d.priority
												)}`}
											>
												{priorityLabels[
													d.priority as keyof typeof priorityLabels
												] || d.priority}
											</span>
										</td>
										<td className='px-6 py-4 text-center text-sm text-gray-500'>
											{new Date(d.created_at).toLocaleDateString('ru-RU')}
										</td>
										<td className='px-6 py-4 text-center'>
											<Link
												href={`/defects/${d.id}`}
												className='text-blue-600 hover:text-blue-800 font-medium transition'
											>
												Открыть
											</Link>
										</td>
									</tr>
								))}
								{rows.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className='px-6 py-12 text-center text-gray-500'
										>
											<div className='text-lg font-medium'>
												Дефекты не найдены
											</div>
											<div className='text-sm'>
												Попробуйте изменить параметры поиска
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className='flex justify-between items-center text-sm text-gray-500'>
					<span>Всего найдено: {total}</span>
				</div>

				<CreateDefectDialog
					open={openCreate}
					onClose={() => setOpenCreate(false)}
					onCreated={() => {
						if (!token) return
						api<{ items: Defect[]; total: number }>(
							`/api/defects?${query}`,
							'GET',
							undefined,
							token
						)
							.then(d => {
								setRows(d.items)
								setTotal(d.total)
							})
							.catch(console.error)
					}}
				/>
				<Toast />
			</div>
		</AuthGuard>
	)
}
