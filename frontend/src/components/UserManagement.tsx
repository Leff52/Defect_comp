'use client'
import { useState, useEffect } from 'react'
import { getUsers, deleteUser, User } from '@/lib/users'
import { useAuth } from '@/store/auth'
import CreateUserDialog from './CreateUserDialog'

interface UserManagementProps {
	userRoles: string[]
}

export default function UserManagement({ userRoles }: UserManagementProps) {
	const { token, user: currentUser } = useAuth()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [deletingUser, setDeletingUser] = useState<string | null>(null)

	const canManageUsers = userRoles.includes('Admin') || userRoles.includes('Lead')
	const isAdmin = userRoles.includes('Admin')
	const isLead = userRoles.includes('Lead')

	const canDeleteUser = (userToDelete: User) => {
		// Нельзя удалить себя
		if (userToDelete.id === currentUser?.id) return false
		
		// Admin может удалить всех
		if (isAdmin) return true
		// Lead не может удалить Admin и Lead
		if (isLead) {
			if (userToDelete.roles.includes('Admin')) return false
			if (userToDelete.roles.includes('Lead')) return false
			return true
		}
		
		return false
	}

	const fetchUsers = async () => {
		if (!token || !canManageUsers) return

		setLoading(true)
		setError('')

		try {
			const response = await getUsers(token)
			setUsers(response.users)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при загрузке пользователей')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteUser = async (userId: string, userEmail: string) => {
		if (!token || !confirm(`Вы уверены что хотите удалить пользователя ${userEmail}?`)) return

		setDeletingUser(userId)

		try {
			await deleteUser(userId, token)
			await fetchUsers() // Обновляем список
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при удалении пользователя')
		} finally {
			setDeletingUser(null)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [token, canManageUsers])

	if (!canManageUsers) {
		return null
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold text-gray-900">Управление пользователями</h2>
				<button
					onClick={() => setShowCreateDialog(true)}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Создать пользователя
				</button>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			{loading ? (
				<div className="text-center py-8">
					<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
					<p className="mt-2 text-gray-600">Загрузка пользователей...</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
								<th className="text-left py-3 px-4 font-medium text-gray-900">Имя</th>
								<th className="text-left py-3 px-4 font-medium text-gray-900">Роли</th>
								<th className="text-left py-3 px-4 font-medium text-gray-900">Дата создания</th>
								<th className="text-left py-3 px-4 font-medium text-gray-900">Действия</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
									<td className="py-3 px-4 text-gray-900">{user.email}</td>
									<td className="py-3 px-4 text-gray-900">{user.full_name}</td>
									<td className="py-3 px-4">
										<div className="flex flex-wrap gap-1">
											{user.roles.map((role) => (
												<span
													key={role}
													className={`inline-block px-2 py-1 text-xs rounded ${
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
											))}
										</div>
									</td>
									<td className="py-3 px-4 text-gray-600">
										{new Date(user.created_at).toLocaleDateString('ru-RU')}
									</td>
									<td className="py-3 px-4">
										{canDeleteUser(user) && (
											<button
												onClick={() => handleDeleteUser(user.id, user.email)}
												disabled={deletingUser === user.id}
												className="text-red-600 hover:text-red-800 disabled:opacity-50"
											>
												{deletingUser === user.id ? 'Удаление...' : 'Удалить'}
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{users.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							Пользователи не найдены
						</div>
					)}
				</div>
			)}

			<CreateUserDialog
				isOpen={showCreateDialog}
				onClose={() => setShowCreateDialog(false)}
				onUserCreated={fetchUsers}
				userRoles={userRoles}
			/>
		</div>
	)
}