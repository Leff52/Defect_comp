'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/store/auth'
import { api, getProjectsForSelect } from '@/lib/api'
import { useToast } from './Toast'

type Project = { id: string; name: string }

const priorityLabels = {
	low: 'Низкий',
	med: 'Средний',
	high: 'Высокий',
	critical: 'Критический'
}

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
	const [priority, setPriority] = useState<'low' | 'med' | 'high' | 'critical'>('med')
	const [description, setDescription] = useState('')
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		if (!open || !token) return
		getProjectsForSelect()
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
			show('Заполните заголовок и выберите проект')
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
			show('Дефект успешно создан')
			reset()
			onCreated()
			onClose()
		} catch (e: any) {
			show(e.message || 'Ошибка при создании дефекта')
		} finally {
			setBusy(false)
		}
	}

	if (!open) return null

	return (
		<>
			<div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
			<div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Создать новый дефект</h2>
				</div>
				
				<div className="p-6 space-y-5">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Заголовок
						</label>
						<input
							className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							placeholder="Введите название дефекта"
							value={title}
							onChange={e => setTitle(e.target.value)}
							autoFocus
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Проект
						</label>
						<select
							className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							value={projectId}
							onChange={e => setProjectId(e.target.value)}
						>
							<option value="">Выберите проект</option>
							{projects.map(p => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Приоритет
						</label>
						<select
							className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							value={priority}
							onChange={e => setPriority(e.target.value as any)}
						>
							{Object.entries(priorityLabels).map(([key, label]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Описание
						</label>
						<textarea
							className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
							rows={4}
							placeholder="Подробное описание дефекта "
							value={description}
							onChange={e => setDescription(e.target.value)}
						/>
					</div>
				</div>

				<div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
					<button 
						className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition"
						onClick={onClose}
						disabled={busy}
					>
						Отмена
					</button>
					<button
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
						disabled={busy || !title.trim() || !projectId}
						onClick={create}
					>
						{busy ? 'Создание...' : 'Создать дефект'}
					</button>
				</div>
			</div>
			<Toast />
		</>
	)
}
