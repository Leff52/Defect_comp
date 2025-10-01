'use client';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginResp = {
	token: string;
	user: { id: string; email: string; full_name: string; roles: string[] }
};

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const router = useRouter();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(null);
		setLoading(true);
		
		try {
			const data = await api('/api/auth/login', 'POST', { email, password }) as LoginResp;
			login(data.user, data.token);
			router.replace('/defects');
		} catch (e: any) {
			setErr(e?.message || 'Ошибка входа');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300">
			<div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
				<h1 className="text-3xl font-bold text-center mb-6 tracking-tight text-slate-900">Вход</h1>
				
				{err && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									Ошибка входа
								</h3>
								<div className="mt-1 text-sm text-red-700">
									{err}
								</div>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={onSubmit} className="space-y-5">
					<input
						type="email"
						className={`w-full border ${err ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} text-gray-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 transition`}
						placeholder="Электронная почта"
						value={email}
						onChange={e => setEmail(e.target.value)}
						autoFocus
					/>
					<input
						type="password"
						className={`w-full border ${err ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} text-gray-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 transition`}
						placeholder="Пароль"
						value={password}
						onChange={e => setPassword(e.target.value)}
					/>
					<button
						type="submit"
						className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						disabled={!email || !password || loading}
					>
						{loading ? (
							<>
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="m15.84 10.2c.16-.6.24-1.26.24-1.95 0-4.418-3.58-8-8-8s-8 3.582-8 8c0 .69.08 1.35.24 1.95.11.45.33.85.64 1.16l2.42 2.42c.31.31.71.53 1.16.64.6.16 1.26.24 1.95.24s1.35-.08 1.95-.24c.45-.11.85-.33 1.16-.64l2.42-2.42c.31-.31.53-.71.64-1.16z" />
								</svg>
								Вход...
							</>
						) : (
							'Войти'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}