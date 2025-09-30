'use client';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginResp = {
	token: string
	user: { id: string; email: string; full_name: string; roles: string[] }
}


export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [err, setErr] = useState<string | null>(null)
	const { login } = useAuth()
	const router = useRouter()

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErr(null)
		try {
			const data = await api<LoginResp>('/api/auth/login', 'POST', {
				email,
				password,
			})
			login(data.user, data.token)
			router.replace('/defects')
		} catch (e: any) {
			setErr(e?.message || 'Ошибка входа')
		}
	}

	return (
		<div className='max-w-lg mx-auto mt-16 bg-white p-6 rounded shadow'>
			<h1 className='text-2xl font-semibold mb-4'>Добро пожаловать</h1>
			<form onSubmit={onSubmit} className='space-y-3'>
				<input
					className='w-full border rounded px-3 py-2'
					placeholder='Электронная почта'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
				<input
					className='w-full border rounded px-3 py-2'
					type='password'
					placeholder='Пароль'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				{err && <div className='text-red-600 text-sm'>{err}</div>}
				<button className='px-4 py-2 bg-slate-900 text-white rounded w-full'>
					Войти в систему
				</button>
			</form>
		</div>
	)
}