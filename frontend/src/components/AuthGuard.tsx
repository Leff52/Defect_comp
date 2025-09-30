'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/store/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { token, hydrated, hydrate } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (!hydrated) hydrate()
	}, [hydrated, hydrate])

	useEffect(() => {
		if (hydrated && !token) {
			router.replace(`/login?next=${encodeURIComponent(pathname)}`)
		}
	}, [hydrated, token, pathname, router])

	if (!hydrated) return null // можно отрисовать спиннер, фиджет спиннер
	if (!token) return null

	return <>{children}</>
}
