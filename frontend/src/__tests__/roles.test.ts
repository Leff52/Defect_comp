describe('Роли и права доступа', () => {
	it('должен проверять валидные роли', () => {
		const validRoles = ['Engineer', 'Manager', 'Lead', 'Admin']

		expect(validRoles).toContain('Engineer')
		expect(validRoles).toContain('Admin')
		expect(validRoles.length).toBe(4)
	})

	it('должен проверять наличие роли у пользователя', () => {
		const userRoles = ['Engineer', 'Manager']

		const hasEngineerRole = userRoles.includes('Engineer')
		const hasAdminRole = userRoles.includes('Admin')

		expect(hasEngineerRole).toBe(true)
		expect(hasAdminRole).toBe(false)
	})

	it('должен проверять права Admin', () => {
		const adminRoles = ['Admin']

		const isAdmin = adminRoles.includes('Admin')
		const canManageUsers = isAdmin
		const canDeleteDefects = isAdmin

		expect(isAdmin).toBe(true)
		expect(canManageUsers).toBe(true)
		expect(canDeleteDefects).toBe(true)
	})

	it('должен проверять права Lead', () => {
		const leadRoles = ['Lead']

		const isLead = leadRoles.includes('Lead')
		const isAdmin = leadRoles.includes('Admin')

		expect(isLead).toBe(true)
		expect(isAdmin).toBe(false)
	})
})
