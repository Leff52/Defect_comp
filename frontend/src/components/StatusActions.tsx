'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

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
	const { user } = useAuth()
	const [busy, setBusy] = useState<string | null>(null)

	const roles = user?.roles ?? []
	const next = transitions[current] || []
	const allowed = next.filter(s =>
		roles.some(r => statusByRole[r]?.includes(s))
	)

	if (allowed.length === 0) {
		return null 
	}

	const click = async (s: Status) => {
		try {
			setBusy(s)
			const updated = await api<{ id: string; status: Status }>(
				`/api/defects/${defectId}/status`,
				'PATCH',
				{ status: s }
			)
			onChanged(updated)
		} finally {
			setBusy(null)
		}
	}

	return (
		<div className='flex gap-8 mb-4'>
			{allowed.map(s => (
				<button
					key={s}
					onClick={() => click(s)}
					disabled={busy === s}
					className='px-3 py-1 rounded bg-slate-900 text-white disabled:opacity-50'
				>
					{s === 'closed'
						? 'Закрыть'
						: s === 'canceled'
						? 'Отменить'
						: labels[s]}
				</button>
			))}
		</div>
	)
}
