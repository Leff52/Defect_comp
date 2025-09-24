import { create } from 'zustand'

type AuthState = {
	token: string | null
	user: { id: string; email: string; full_name: string; roles: string[] } | null
	setAuth: (token: string, user: AuthState['user']) => void
	logout: () => void
}

export const useAuth = create<AuthState>(set => ({
	token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
	user:
		typeof window !== 'undefined'
			? JSON.parse(localStorage.getItem('user') || 'null')
			: null,
	setAuth: (token, user) => {
		localStorage.setItem('token', token)
		localStorage.setItem('user', JSON.stringify(user))
		set({ token, user })
	},
	logout: () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		set({ token: null, user: null })
	},
}))
