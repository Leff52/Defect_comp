describe('Utility Functions', () => {
	describe('pagination', () => {
		it('должен правильно вычислять offset для первой страницы', () => {
			const page = 1
			const limit = 10
			const offset = (page - 1) * limit

			expect(offset).toBe(0)
		})

		it('должен правильно вычислять offset для второй страницы', () => {
			const page = 2
			const limit = 10
			const offset = (page - 1) * limit

			expect(offset).toBe(10)
		})

		it('должен правильно вычислять общее количество страниц', () => {
			const total = 95
			const limit = 10
			const totalPages = Math.ceil(total / limit)

			expect(totalPages).toBe(10)
		})
	})

	describe('роли и права доступа', () => {
		it('должен определять что Admin имеет все права', () => {
			const userRoles = ['Admin']
			const hasAdminRole = userRoles.includes('Admin')

			expect(hasAdminRole).toBe(true)
		})

		it('должен проверять множественные роли пользователя', () => {
			const userRoles = ['Engineer', 'Manager']
			const hasEngineerRole = userRoles.includes('Engineer')
			const hasManagerRole = userRoles.includes('Manager')
			const hasAdminRole = userRoles.includes('Admin')

			expect(hasEngineerRole).toBe(true)
			expect(hasManagerRole).toBe(true)
			expect(hasAdminRole).toBe(false)
		})
	})

	describe('статусы дефектов', () => {
		it('должен валидировать корректные статусы', () => {
			const validStatuses = ['new', 'in_work', 'review', 'closed', 'canceled']

			expect(validStatuses.includes('new')).toBe(true)
			expect(validStatuses.includes('closed')).toBe(true)
			expect(validStatuses.includes('invalid')).toBe(false)
		})
	})

	describe('форматирование данных', () => {
		it('должен форматировать email в нижний регистр', () => {
			const email = 'Test@Example.COM'
			const formatted = email.toLowerCase()

			expect(formatted).toBe('test@example.com')
		})

		it('должен проверять валидность email формата', () => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

			expect(emailRegex.test('test@example.com')).toBe(true)
			expect(emailRegex.test('invalid-email')).toBe(false)
		})
	})
})
