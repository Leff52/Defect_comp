import fetcher from './fetcher'

export interface User {
	id: string
	email: string
	full_name: string
	roles: string[]
	created_at: string
	updated_at: string
}

export interface CreateUserRequest {
	email: string
	password: string
	fullName: string
	roles: string[]
}

export interface CreateUserResponse {
	user: User
}

export interface GetUsersResponse {
	users: User[]
}

export const createUser = async (data: CreateUserRequest, token: string): Promise<CreateUserResponse> => {
	return fetcher<CreateUserResponse>('/api/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	})
}

export const getUsers = async (token: string): Promise<GetUsersResponse> => {
	return fetcher<GetUsersResponse>('/api/users', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
}

export const deleteUser = async (userId: string, token: string): Promise<{ message: string }> => {
	return fetcher<{ message: string }>(`/api/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
}