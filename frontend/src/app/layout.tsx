import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata = {
	title: 'Defect Manager',
	description: 'Управление дефектами',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru'>
			<body className='min-h-screen bg-slate-50 text-slate-900'>
				<Navbar />
				<main className='max-w-6xl mx-auto px-4 py-6'>{children}</main>
			</body>
		</html>
	)
}
