// store/auth.ts
'use client'
import { create } from 'zustand'

type User = { id: string; email: string; full_name: string; roles: string[] }

type State = {
  token: string | null
  user: User | null
  hydrated: boolean
  login: (u: User, t: string) => void
  setAuth: (t: string, u: User) => void
  logout: () => void
  hydrate: () => void
}

export const useAuth = create<State>((set, get) => ({
	token: null,
	user: null,
	hydrated: false,

	setAuth: (token, user) => {
		localStorage.setItem('token', token)
		localStorage.setItem('user', JSON.stringify(user))
		set({ token, user })
	},
	hydrate: () => {
		// хз что у меня с токеннами поэтому каждый раз читаю из любого старого ключа, чтобы не зависнуть без токена
		const token =
			localStorage.getItem('token') ||
			localStorage.getItem('authToken') ||
			localStorage.getItem('auth_token') ||
			null

		const userJson = localStorage.getItem('user')
		let user: User | null = null
		if (userJson) {
			try {
				user = JSON.parse(userJson)
			} catch {}
		}

		set({ token, user, hydrated: true })
	},

	login: (user, token) => {
		// единый ключ + на переходный период дублируем в старые чтобы ничего не отвалилось
		localStorage.setItem('token', token)
		localStorage.setItem('authToken', token)
		localStorage.setItem('auth_token', token)
		localStorage.setItem('user', JSON.stringify(user))
		set({ token, user })
	},

	logout: () => {
		;[
			'token',
			'authToken',
			'auth_token',
			'user',
			'auth',
			'auth_expiry',
			'tokenExpiration',
		].forEach(k => localStorage.removeItem(k))
		set({ token: null, user: null })
	},
}))
