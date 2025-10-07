describe('Валидация форм', () => {
	it('должен валидировать email', () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		expect(emailRegex.test('user@example.com')).toBe(true)
		expect(emailRegex.test('test@mail.ru')).toBe(true)
		expect(emailRegex.test('invalid-email')).toBe(false)
		expect(emailRegex.test('@example.com')).toBe(false)
	})

	it('должен валидировать длину пароля', () => {
		const validatePassword = (password: string): boolean => {
			return password.length >= 4
		}

		expect(validatePassword('1234')).toBe(true)
		expect(validatePassword('password123')).toBe(true)
		expect(validatePassword('123')).toBe(false)
	})

	it('должен валидировать обязательные поля', () => {
		const validateRequired = (value: string): boolean => {
			return value.trim().length > 0
		}

		expect(validateRequired('Test')).toBe(true)
		expect(validateRequired('  Test  ')).toBe(true)
		expect(validateRequired('')).toBe(false)
		expect(validateRequired('   ')).toBe(false)
	})

	it('должен валидировать данные дефекта', () => {
		interface DefectData {
			title: string
			project_id: string
			priority: 'low' | 'medium' | 'high' | 'critical'
		}

		const validateDefect = (data: Partial<DefectData>): boolean => {
			return !!(data.title && data.project_id && data.priority)
		}

		const validDefect: DefectData = {
			title: 'Bug in UI',
			project_id: '123',
			priority: 'high',
		}

		const invalidDefect = {
			title: 'Bug',
			project_id: '',
		}

		expect(validateDefect(validDefect)).toBe(true)
		expect(validateDefect(invalidDefect)).toBe(false)
	})
})
