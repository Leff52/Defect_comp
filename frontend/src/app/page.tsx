'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/store/auth'

export default function Home() {
	const { token } = useAuth()
	const router = useRouter()
	useEffect(() => {
		router.replace(token ? '/defects' : '/login')
	}, [token, router])
	return null
}
