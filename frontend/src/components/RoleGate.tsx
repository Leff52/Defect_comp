'use client'
import { useAuth } from '@/store/auth'

export function RoleGate({
	anyOf,
	children,
}: {
	anyOf: string[]
	children: React.ReactNode
}) {
	const { user } = useAuth()
	const ok = user?.roles?.some(r => anyOf.includes(r))
	if (!ok) return null
	return <>{children}</>
}
