// frontend/src/components/Navbar.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

export function Navbar() {
	const { user, logout, hydrate } = useAuth()
	useEffect(() => {
		hydrate()
	}, [hydrate])

	return (
		<header className='border-b bg-white sticky top-0 z-40'>
			<div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
				<div className='flex items-center gap-6'>
					<Link href='/defects' className='font-semibold'>
						Defect Manager
					</Link>
					<Link href='/defects' className='text-sm'>
						Дефекты
					</Link>
				</div>
				<div className='flex items-center gap-3'>
					{user ? (
						<>
							<span className='text-sm'>
								{user.full_name} ({user.roles.join(', ')})
							</span>
							<button
								onClick={logout}
								className='text-sm px-3 py-1 rounded bg-slate-900 text-white'
							>
								Выйти
							</button>
						</>
					) : (
						<Link
							className='text-sm px-3 py-1 rounded bg-slate-900 text-white'
							href='/login'
						>
							Войти
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}