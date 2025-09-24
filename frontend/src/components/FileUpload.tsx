'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

export function FileUpload({
	defectId,
	token,
	onUploaded,
}: {
	defectId: string
	token: string
	onUploaded: () => void
}) {
	const [busy, setBusy] = useState(false)

	const onChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
		const file = e.target.files?.[0]
		if (!file) return
		setBusy(true)
		try {
			const fd = new FormData()
			fd.append('file', file)
			await api(`/api/defects/${defectId}/attachments`, 'POST', fd, token)
			onUploaded()
		} catch (e) {
			console.error(e)
		} finally {
			setBusy(false)
			e.currentTarget.value = ''
		}
	}

	return (
		<label className='inline-flex items-center gap-2 cursor-pointer'>
			<span className='px-3 py-1 bg-slate-900 text-white rounded text-sm'>
				{busy ? 'Загрузка…' : 'Прикрепить файл'}
			</span>
			<input
				type='file'
				className='hidden'
				onChange={onChange}
				disabled={busy}
			/>
		</label>
	)
}
