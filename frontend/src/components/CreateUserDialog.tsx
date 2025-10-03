'use client'
import { useState } from 'react'
import { createUser, CreateUserRequest } from '@/lib/users'
import { useAuth } from '@/store/auth'

interface CreateUserDialogProps {
	isOpen: boolean
	onClose: () => void
	onUserCreated: () => void
	userRoles: string[]
}

export default function CreateUserDialog({ isOpen, onClose, onUserCreated, userRoles }: CreateUserDialogProps) {
	const { token } = useAuth()
	const [formData, setFormData] = useState<CreateUserRequest>({
		email: '',
		password: '',
		fullName: '',
		roles: []
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const isAdmin = userRoles.includes('Admin')
	const isLead = userRoles.includes('Lead')

	const availableRoles = isAdmin 
		? ['Engineer', 'Manager', 'Lead', 'Admin']
		: isLead 
		? ['Engineer', 'Manager']
		: []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!token) return

		setLoading(true)
		setError('')

		try {
			await createUser(formData, token)
			setFormData({ email: '', password: '', fullName: '', roles: [] })
			onUserCreated()
			onClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при создании пользователя')
		} finally {
			setLoading(false)
		}
	}

	const handleRoleChange = (role: string, checked: boolean) => {
		setFormData(prev => ({
			...prev,
			roles: checked 
				? [...prev.roles, role]
				: prev.roles.filter(r => r !== role)
		}))
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden'>
				<div className='px-6 py-4 border-b border-gray-100'>
					<h2 className='text-lg font-semibold text-gray-900'>
						Новый пользователь
					</h2>
					<p className='text-sm text-gray-500 mt-1'>
						Создайте учетную запись для нового сотрудника
					</p>
				</div>

				<div className='px-6 py-4'>
					{error && (
						<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
							<p className='text-red-600 text-sm'>{error}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Email
							</label>
							<input
								type='email'
								value={formData.email}
								onChange={e =>
									setFormData(prev => ({ ...prev, email: e.target.value }))
								}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm'
								placeholder='user@company.com'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Пароль
							</label>
							<input
								type='password'
								value={formData.password}
								onChange={e =>
									setFormData(prev => ({ ...prev, password: e.target.value }))
								}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm'
								placeholder='Минимум 4 символа'
								minLength={4}
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Полное имя
							</label>
							<input
								type='text'
								value={formData.fullName}
								onChange={e =>
									setFormData(prev => ({ ...prev, fullName: e.target.value }))
								}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm'
								placeholder='Иван Иванов'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Роли
							</label>
							<div className='space-y-2'>
								{availableRoles.map(role => (
									<label
										key={role}
										className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer'
									>
										<div className='flex items-center'>
											<input
												type='checkbox'
												checked={formData.roles.includes(role)}
												onChange={e => handleRoleChange(role, e.target.checked)}
												className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
											/>
											<span className='ml-2 text-sm text-gray-900'>{role}</span>
										</div>
										<span
											className={`px-2 py-1 text-xs rounded-full font-medium ${
												role === 'Admin'
													? 'bg-red-100 text-red-800'
													: role === 'Lead'
													? 'bg-purple-100 text-purple-800'
													: role === 'Manager'
													? 'bg-blue-100 text-blue-800'
													: 'bg-green-100 text-green-800'
											}`}
										>
											{role}
										</span>
									</label>
								))}
							</div>
							{formData.roles.length === 0 && (
								<p className='text-red-500 text-xs mt-1'>
									Выберите хотя бы одну роль
								</p>
							)}
						</div>
					</form>
				</div>
				<div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors'
						disabled={loading}
					>
						Отмена
					</button>
					<button
						onClick={handleSubmit}
						className='flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						disabled={loading || formData.roles.length === 0}
					>
						{loading ? 'Создание...' : 'Создать'}
					</button>
				</div>
			</div>
		</div>
	)
}