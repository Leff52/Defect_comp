describe('Статусы дефектов', () => {
	it('должен проверять валидные статусы', () => {
		const validStatuses = ['open', 'in_work', 'in_review', 'closed', 'canceled']

		expect(validStatuses).toContain('open')
		expect(validStatuses).toContain('closed')
		expect(validStatuses.length).toBe(5)
	})

	it('должен переводить статусы на русский язык', () => {
		const getStatusLabel = (status: string): string => {
			const labels: Record<string, string> = {
				open: 'Открыт',
				in_work: 'В работе',
				in_review: 'На проверке',
				closed: 'Закрыт',
				canceled: 'Отменён',
			}
			return labels[status] || status
		}

		expect(getStatusLabel('open')).toBe('Открыт')
		expect(getStatusLabel('in_work')).toBe('В работе')
		expect(getStatusLabel('closed')).toBe('Закрыт')
	})

	it('должен проверять переходы статусов', () => {
		const allowedTransitions: Record<string, string[]> = {
			open: ['in_work'],
			in_work: ['in_review'],
			in_review: ['closed', 'canceled'],
			closed: [],
			canceled: [],
		}

		expect(allowedTransitions['open']).toContain('in_work')
		expect(allowedTransitions['in_review']).toContain('closed')
		expect(allowedTransitions['closed']).toHaveLength(0)
	})

	it('должен фильтровать дефекты по статусу', () => {
		const defects = [
			{ id: 1, status: 'open' },
			{ id: 2, status: 'closed' },
			{ id: 3, status: 'open' },
		]

		const openDefects = defects.filter(d => d.status === 'open')
		const closedDefects = defects.filter(d => d.status === 'closed')

		expect(openDefects).toHaveLength(2)
		expect(closedDefects).toHaveLength(1)
	})
})
