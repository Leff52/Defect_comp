'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { useToast } from './Toast'

type Project = { id: string; name: string }

export function CreateDefectDialog({
	open,
	onClose,
	onCreated,
}: {
	open: boolean
	onClose: () => void
	onCreated: () => void
}) {
	const { token } = useAuth()
	const { Toast, show } = useToast()

	const [projects, setProjects] = useState<Project[]>([])
	const [title, setTitle] = useState('')
	const [projectId, setProjectId] = useState('')
	const [priority, setPriority] = useState<'low' | 'med' | 'high' | 'critical'>(
		'med'
	)
	const [description, setDescription] = useState('')
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		if (!open || !token) return
		api<Project[]>('/api/projects', 'GET', undefined, token)
			.then(setProjects)
			.catch(() => show('Не удалось загрузить проекты'))
	}, [open, token])

	const reset = () => {
		setTitle('')
		setProjectId('')
		setPriority('med')
		setDescription('')
	}

	const create = async () => {
		if (!title.trim() || !projectId) {
			show('Заполни заголовок и проект')
			return
		}
		try {
			setBusy(true)
			await api(
				'/api/defects',
				'POST',
				{
					title,
					project_id: projectId,
					priority,
					description: description || null,
				},
				token || undefined
			)
			show('Дефект создан')
			reset()
			onCreated()
			onClose()
		} catch (e: any) {
			show(e.message || 'Ошибка создания')
		} finally {
			setBusy(false)
		}
	}

	if (!open) return null

	return (
		<>
			<div className='fixed inset-0 bg-black/40 z-40' onClick={onClose} />
			<div className='fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow max-w-lg w-full'>
				<div className='p-4 border-b font-semibold'>Создать дефект</div>
				<div className='p-4 space-y-3'>
					<input
						className='w-full border rounded px-3 py-2'
						placeholder='Заголовок'
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
					<select
						className='w-full border rounded px-3 py-2'
						value={projectId}
						onChange={e => setProjectId(e.target.value)}
					>
						<option value=''>Выбери проект</option>
						{projects.map(p => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
					<select
						className='w-full border rounded px-3 py-2'
						value={priority}
						onChange={e => setPriority(e.target.value as any)}
					>
						<option value='low'>low</option>
						<option value='med'>med</option>
						<option value='high'>high</option>
						<option value='critical'>critical</option>
					</select>
					<textarea
						className='w-full border rounded px-3 py-2'
						rows={4}
						placeholder='Описание (необязательно)'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</div>
				<div className='p-4 border-t flex items-center justify-end gap-2'>
					<button className='px-3 py-2 rounded border' onClick={onClose}>
						Отмена
					</button>
					<button
						className='px-3 py-2 rounded bg-slate-900 text-white disabled:opacity-50'
						disabled={busy}
						onClick={create}
					>
						{busy ? 'Создаю…' : 'Создать'}
					</button>
				</div>
			</div>
			<Toast />
		</>
	)
}
