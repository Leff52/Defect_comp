'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { FileUpload } from '@/components/FileUpload'


type Defect = {
	id: string
	title: string
	description?: string | null
	status: string
	priority: string
	created_at: string
	assignee_id?: string | null
}
type Comment = {
	id: string
	text: string
	author_id: string
	created_at: string
}
type Attachment = {
	id: string
	file_name: string
	url_or_path: string
	created_at: string
}

export default function DefectDetails() {
	const { id } = useParams<{ id: string }>()
	const { token } = useAuth()
	const [row, setRow] = useState<Defect | null>(null)
	const [comments, setComments] = useState<Comment[]>([])
	const [attachments, setAttachments] = useState<Attachment[]>([])
	const [text, setText] = useState('')
	
	const refresh = async () => {
		if (!token) return
		const d = await api<Defect>(`/api/defects/${id}`, 'GET', undefined, token)
		const cs = await api<{ items: Comment[]; total: number }>(
			`/api/defects/${id}/comments?limit=100`,
			'GET',
			undefined,
			token
		)
		const at = await api<{ items: Attachment[]; total: number }>(
			`/api/defects/${id}/attachments`,
			'GET',
			undefined,
			token
		)
		setRow(d)
		setComments(cs.items)
		setAttachments(at.items)
	}

	useEffect(() => {
		refresh().catch(console.error)
	}, [id, token])

	const addComment = async () => {
		if (!text.trim() || !token) return
		await api(`/api/defects/${id}/comments`, 'POST', { text }, token)
		setText('')
		refresh()
	}
	const transitions: Record<string, string[]> = {
		new: ['in_work'],
		in_work: ['review'],
		review: ['closed', 'canceled'],
		closed: [],
		canceled: [],
	}
	const statusByRole: Record<string, string[]> = {
		Engineer: ['in_work', 'review'],
		Manager: ['in_work', 'review', 'closed', 'canceled'],
		Lead: ['in_work', 'review', 'closed', 'canceled'],
		Admin: ['in_work', 'review', 'closed', 'canceled'],
	}
	const canSet = (roles: string[] | undefined, target: string) =>
		roles?.some(r => statusByRole[r]?.includes(target)) ?? false

	const changeStatus = async (next: string) => {
		if (!token) return
		await api(`/api/defects/${id}/status`, 'PATCH', { status: next }, token)
		await refresh()
	}

	if (!row) return null

	return (
		<div className='space-y-6'>
			<div className='bg-white border rounded p-4'>
				<h1 className='text-xl font-semibold mb-1'>{row.title}</h1>
				<div className='text-sm text-slate-600 mb-2'>
					Статус: {row.status} • Приоритет: {row.priority}
				</div>
				{row.description && (
					<p className='text-sm whitespace-pre-wrap'>{row.description}</p>
				)}
			</div>

			<div className='grid md:grid-cols-2 gap-6'>
				<div className='bg-white border rounded p-4'>
					<h2 className='font-semibold mb-3'>Комментарии</h2>
					<div className='space-y-3 max-h-64 overflow-auto'>
						{comments.map(c => (
							<div key={c.id} className='text-sm border-b pb-2'>
								<div className='text-slate-500'>
									{new Date(c.created_at).toLocaleString()}
								</div>
								<div>{c.text}</div>
							</div>
						))}
						{comments.length === 0 && (
							<div className='text-sm text-slate-500'>
								Пока нет комментариев
							</div>
						)}
					</div>
					<div className='mt-3 flex gap-2'>
						<input
							value={text}
							onChange={e => setText(e.target.value)}
							placeholder='Написать комментарий…'
							className='flex-1 border rounded px-3 py-2'
						/>
						<button
							onClick={addComment}
							className='px-3 py-2 bg-slate-900 text-white rounded'
						>
							Отправить
						</button>
					</div>
				</div>

				<div className='bg-white border rounded p-4'>
					<div className='flex items-center justify-between mb-3'>
						<h2 className='font-semibold'>Вложения</h2>
						{token && (
							<FileUpload defectId={id} token={token} onUploaded={refresh} />
						)}
					</div>
					<ul className='text-sm space-y-2 max-h-64 overflow-auto'>
						{attachments.map(a => {
							const url = a.url_or_path.startsWith('/files')
								? `${process.env.NEXT_PUBLIC_API_URL}${a.url_or_path}`
								: `${process.env.NEXT_PUBLIC_API_URL}/files/${a.url_or_path}`
							return (
								<li
									key={a.id}
									className='flex items-center justify-between border-b pb-1'
								>
									<span>{a.file_name}</span>
									<a
										href={url}
										target='_blank'
										className='text-blue-700 underline'
										rel='noreferrer'
									>
										Скачать
									</a>
								</li>
							)
						})}
						{attachments.length === 0 && (
							<li className='text-slate-500'>Файлов нет</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	)
}
