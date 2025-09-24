'use client'
import { useEffect, useState } from 'react'

export function useToast() {
	const [msg, setMsg] = useState<string | null>(null)
	useEffect(() => {
		if (!msg) return
		const t = setTimeout(() => setMsg(null), 2500)
		return () => clearTimeout(t)
	}, [msg])
	return {
		show: (m: string) => setMsg(m),
		Toast: () =>
			msg ? (
				<div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50'>
					<div className='px-4 py-2 rounded bg-slate-900 text-white shadow'>
						{msg}
					</div>
				</div>
			) : null,
	}
}
