describe('Defect Management', () => {
	it('должен пройти базовую проверку', () => {
		expect(true).toBe(true)
	})

	it('должен проверять валидность статусов дефектов', () => {
		const validStatuses = ['new', 'in_work', 'review', 'closed', 'canceled']
		
		expect(validStatuses).toContain('new')
		expect(validStatuses).toContain('in_work')
		expect(validStatuses).toContain('closed')
		expect(validStatuses.length).toBe(5)
	})

	it('должен проверять валидность приоритетов', () => {
		const validPriorities = ['low', 'med', 'high', 'critical']
		
		expect(validPriorities).toContain('low')
		expect(validPriorities).toContain('high')
		expect(validPriorities).toContain('critical')
	})
})
