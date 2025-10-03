'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

export function Navbar() {
	const { user, logout, hydrate } = useAuth()
	
	useEffect(() => {
		hydrate()
	}, [hydrate])

	const initials = user?.full_name
		?.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase() || '?'

	return (
		<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center space-x-8">
						<Link 
							href="/defects" 
							className="text-xl font-bold text-gray-900 hover:text-blue-600 transition"
						>
							Система Контроля
						</Link>
						<nav className="hidden md:flex space-x-6">
							<Link 
								href="/defects" 
								className="text-gray-600 hover:text-gray-900 font-medium transition"
							>
								Дефекты
							</Link>
							<Link 
								href="/projects" 
								className="text-gray-600 hover:text-gray-900 font-medium transition"
							>
								Проекты
							</Link>
						</nav>
					</div>
					
					<div className="flex items-center space-x-4">
						{user ? (
							<>
								<Link href="/account" className="hidden sm:flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200">
									<div className="text-right">
										<div className="text-sm font-medium text-gray-900">
											{user.full_name}
										</div>
										<div className="text-xs text-gray-500">
											{user.roles.join(' • ')}
										</div>
									</div>
									<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
										{initials}
									</div>
								</Link>
								<button
									onClick={logout}
									className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
								>
									Выйти
								</button>
							</>
						) : (
							<Link
								href="/login"
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
							>
								Войти
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}