'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { useToast } from '@/components/Toast'

type Status = 'new' | 'in_work' | 'review' | 'closed' | 'canceled'

const transitions: Record<Status, Status[]> = {
	new: ['in_work'],
	in_work: ['review'],
	review: ['closed', 'canceled'],
	closed: [],
	canceled: [],
}

const statusByRole: Record<string, Status[]> = {
	Engineer: ['in_work', 'review'],
	Manager: ['in_work', 'review', 'closed', 'canceled'],
	Lead: ['in_work', 'review', 'closed', 'canceled'],
	Admin: ['in_work', 'review', 'closed', 'canceled'],
}

const labels: Record<Status, string> = {
	new: 'В работу',
	in_work: 'На проверку',
	review: 'Закрыть / Отменить',
	closed: 'Закрыт',
	canceled: 'Отменён',
}

export function StatusActions({
	defectId,
	current,
	onChanged,
}: {
	defectId: string
	current: Status
	onChanged: (d: { id: string; status: Status }) => void
}) {
	const { user, token } = useAuth()
	const [busy, setBusy] = useState(false)
	const { show: toast, Toast } = useToast()

	const roles = user?.roles ?? []
	const next = transitions[current] || []
	const allowed = next.filter(s =>
		roles.some(r => statusByRole[r]?.includes(s))
	)

	if (allowed.length === 0) {
		return null 
	}

	async function onClick(nextStatus: 'closed' | 'canceled' | Status) {
		if (busy) return;
		setBusy(true);
		try {
			await api(`/api/defects/${defectId}/status`, 'PATCH', { status: nextStatus }, token);
			toast('Статус обновлён');
			onChanged({ id: defectId, status: nextStatus });
		} catch (e: any) {
			toast(e?.message ?? 'Не удалось изменить статус');
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<div className='flex gap-8 mb-4'>
				{allowed.map(s => (
					<button
						key={s}
						disabled={busy} 
						onClick={() => onClick(s)}
						className='px-3 py-1 rounded bg-slate-900 text-white disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{busy ? 'Обновляем...' : (
							s === 'closed'
								? 'Закрыть'
								: s === 'canceled'
								? 'Отменить'
								: labels[s]
						)}
					</button>
				))}
			</div>
			<Toast />
		</>
	)
}
