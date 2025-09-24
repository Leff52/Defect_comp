'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/store/auth'
import { api, apiBlob } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
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


export default function DefectsPage() {
        <AuthGuard>
			<DefectsPage />
		</AuthGuard>
	const { token } = useAuth()
	const [rows, setRows] = useState<Defect[]>([])
	const [total, setTotal] = useState(0)

	// фильтры
	const [q, setQ] = useState('')
	const [status, setStatus] = useState<string>('')
	const [priority, setPriority] = useState<string>('')
	const [sort, setSort] = useState<string>('created_at:desc')

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
	}, [token, query])

	const download = async (fmt: 'csv' | 'xlsx') => {
		if (!token) return
		const blob = await apiBlob(`/api/defects/export.${fmt}?${query}`, token)
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `defects_${Date.now()}.${fmt}`
		document.body.appendChild(a)
		a.click()
		a.remove()
		URL.revokeObjectURL(url)
    
	}

	return (
        
		<div className='space-y-4'>
			<div className='flex flex-wrap gap-3 items-end justify-between'>
				<h1 className='text-xl font-semibold'>Дефекты</h1>
				<div className='flex flex-wrap gap-2'>
					<input
						value={q}
						onChange={e => setQ(e.target.value)}
						placeholder='Поиск…'
						className='border rounded px-3 py-1'
					/>
					<select
						value={status}
						onChange={e => setStatus(e.target.value)}
						className='border rounded px-2 py-1'
					>
						<option value=''>Все статусы</option>
						{STATUS.map(s => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<select
						value={priority}
						onChange={e => setPriority(e.target.value)}
						className='border rounded px-2 py-1'
					>
						<option value=''>Любой приоритет</option>
						{PRIOR.map(p => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
					<select
						value={sort}
						onChange={e => setSort(e.target.value)}
						className='border rounded px-2 py-1'
					>
						{SORTS.map(s => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<button
						onClick={() => download('csv')}
						className='px-3 py-1 bg-slate-900 text-white rounded text-sm'
					>
						CSV
					</button>
					<button
						onClick={() => download('xlsx')}
						className='px-3 py-1 bg-slate-900 text-white rounded text-sm'
					>
						Excel
					</button>
				</div>
			</div>

			<div className='bg-white border rounded'>
				<table className='w-full text-sm'>
					<thead className='bg-slate-100'>
						<tr>
							<th className='p-2 text-left'>Заголовок</th>
							<th className='p-2'>Статус</th>
							<th className='p-2'>Приоритет</th>
							<th className='p-2'>Создано</th>
							<th className='p-2 w-24'></th>
						</tr>
					</thead>
					<tbody>
						{rows.map(d => (
							<tr key={d.id} className='border-t'>
								<td className='p-2'>{d.title}</td>
								<td className='p-2 text-center'>{d.status}</td>
								<td className='p-2 text-center'>{d.priority}</td>
								<td className='p-2 text-center'>
									{new Date(d.created_at).toLocaleString()}
								</td>
								<td className='p-2 text-right'>
									<Link
										href={`/defects/${d.id}`}
										className='text-blue-700 underline'
									>
										Открыть
									</Link>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={5} className='p-6 text-center text-slate-500'>
									Нет записей
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className='text-xs text-slate-500'>Всего: {total}</div>
		</div>
	)
}
