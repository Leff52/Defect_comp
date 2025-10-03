'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { getMe, changeEmail, changePassword } from '@/lib/me'

export default function AccountPage() {
	const { token, logout, user } = useAuth()
	const router = useRouter()
	const [profile, setProfile] = useState<{
		email: string
		roles: string[]
	} | null>(null)

	const [email, setEmail] = useState('')
	const [currPassForEmail, setCurrPassForEmail] = useState('')
	const [busyEmail, setBusyEmail] = useState(false)

	const [currPass, setCurrPass] = useState('')
	const [newPass, setNewPass] = useState('')
	const [busyPass, setBusyPass] = useState(false)

	useEffect(() => {
		if (!token) {
			router.push('/login')
			return
		}

		;(async () => {
			try {
				const res = await getMe(token)
				setProfile({ email: res.user.email, roles: res.user.roles || [] })
				setEmail(res.user.email || '')
			} catch (e) {
				console.error(e)
			}
		})()
	}, [token, router])

	async function onChangeEmail() {
		if (!email?.trim() || !currPassForEmail) return
		setBusyEmail(true)
		try {
			await changeEmail(
				{ email: email.trim(), current_password: currPassForEmail },
				token
			)
			alert('E-mail обновлён')
			setCurrPassForEmail('')
		} catch (e: any) {
			alert(e?.message ?? 'Не удалось обновить e-mail')
		} finally {
			setBusyEmail(false)
		}
	}

	async function onChangePassword() {
		if (!currPass || !newPass) return
		setBusyPass(true)
		try {
			await changePassword(
				{ current_password: currPass, new_password: newPass },
				token
			)
			alert('Пароль обновлён. Войдите заново.')
			logout()
		} catch (e: any) {
			alert(e?.message ?? 'Не удалось обновить пароль')
		} finally {
			setBusyPass(false)
		}
	}

	if (!token) {
		return <div>Загрузка...</div>
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	const initials = (() => {
		const name = user?.full_name || profile?.email || 'User'
		return name
			.split(' ')
			.map(n => n[0] || '')
			.join('')
			.toUpperCase() || '?'
	})()

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-4xl mx-auto px-6'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
					<div className='bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6'>
						<div className='flex items-center space-x-4'>
							<div className='w-16 h-16 text-blue-800 bg-white bg-opacity-20 rounded-full flex items-center justify-center  font-bold text-xl'>
								{initials}
							</div>
							<div className='text-white'>
								<h1 className='text-2xl font-bold'>
									{user?.full_name || profile?.email}
								</h1>
								<p className='text-blue-100 text-sm'>
									{profile?.roles?.join(' • ') || '—'}
								</p>
							</div>
						</div>
					</div>

					<div className='p-8 space-y-8'>
						<section className='bg-gray-50 rounded-lg p-6'>
							<h2 className='text-lg font-semibold text-gray-900 mb-4'>
								Текущая информация
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='text-sm font-medium text-gray-600 mb-1'>
										Текущий e-mail
									</div>
									<div className='text-lg text-gray-900'>{profile?.email}</div>
								</div>
								<div>
									<div className='text-sm font-medium text-gray-600 mb-1'>
										Роли
									</div>
									<div className='flex flex-wrap gap-2'>
										{profile?.roles?.map((role, index) => (
											<span
												key={index}
												className='px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full'
											>
												{role}
											</span>
										))}
									</div>
								</div>
							</div>
						</section>

						<section className='bg-white rounded-lg border border-gray-200 p-6'>
							<div className='flex items-center space-x-3 mb-6'>
								<div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
									<svg
										className='w-4 h-4 text-blue-600'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
										/>
									</svg>
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Сменить e-mail
								</h2>
							</div>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Новый e-mail
									</label>
									<input
										type='email'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600 focus:border-transparent outline-none transition-all duration-200'
										value={email}
										onChange={e => setEmail(e.target.value)}
										placeholder='example@email.com'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Текущий пароль
									</label>
									<input
										type='password'
										className=' text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200'
										value={currPassForEmail}
										onChange={e => setCurrPassForEmail(e.target.value)}
										placeholder='Введите текущий пароль'
									/>
								</div>
								<button
									className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
									disabled={busyEmail || !email?.trim() || !currPassForEmail}
									onClick={onChangeEmail}
								>
									{busyEmail && (
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
									)}
									<span>Обновить e-mail</span>
								</button>
							</div>
						</section>

						<section className='bg-white rounded-lg border border-gray-200 p-6'>
							<div className='flex items-center space-x-3 mb-6'>
								<div className='w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center'>
									<svg
										className='w-4 h-4 text-emerald-600'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
										/>
									</svg>
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Сменить пароль
								</h2>
							</div>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Текущий пароль
									</label>
									<input
										type='password'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-600 focus:border-transparent outline-none transition-all duration-200'
										value={currPass}
										onChange={e => setCurrPass(e.target.value)}
										placeholder='Введите текущий пароль'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Новый пароль
									</label>
									<input
										type='password'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-600 focus:border-transparent outline-none transition-all duration-200'
										value={newPass}
										onChange={e => setNewPass(e.target.value)}
										placeholder='Минимум 8 символов'
									/>
								</div>
								<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
									<div className='flex items-start space-x-3'>
										<svg
											className='w-5 h-5 text-amber-600 mt-0.5'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
											/>
										</svg>
										<div>
											<p className='text-sm font-medium text-amber-800'>
												Важно!
											</p>
											<p className='text-sm text-amber-700'>
												После смены пароля будет выполнен выход из аккаунта.
											</p>
										</div>
									</div>
								</div>
								<button
									className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
									disabled={busyPass || !currPass || !newPass}
									onClick={onChangePassword}
								>
									{busyPass && (
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
									)}
									<span>Обновить пароль</span>
								</button>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	)
}
