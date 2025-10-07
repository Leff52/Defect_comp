describe('Форматирование данных', () => {
	it('должен форматировать дату', () => {
		const formatDate = (dateString: string): string => {
			const date = new Date(dateString)
			return date.toLocaleDateString('ru-RU')
		}

		const testDate = '2025-10-07T10:00:00Z'
		const formatted = formatDate(testDate)

		expect(formatted).toBeDefined()
		expect(typeof formatted).toBe('string')
	})

	it('должен обрезать длинный текст', () => {
		const truncate = (text: string, maxLength: number): string => {
			if (text.length <= maxLength) return text
			return text.substring(0, maxLength) + '...'
		}

		expect(truncate('Short', 10)).toBe('Short')
		expect(truncate('This is a very long text', 10)).toBe('This is a ...')
		expect(truncate('Exactly 10', 10)).toBe('Exactly 10')
	})

	it('должен приводить текст к нужному регистру', () => {
		const text = 'Test String'

		expect(text.toLowerCase()).toBe('test string')
		expect(text.toUpperCase()).toBe('TEST STRING')
	})

	it('должен удалять пробелы по краям', () => {
		const text = '  test string  '

		expect(text.trim()).toBe('test string')
		expect('   '.trim()).toBe('')
	})

	it('должен форматировать имя пользователя', () => {
		const formatUserName = (fullName: string): string => {
			const parts = fullName.split(' ')
			if (parts.length === 2) {
				return `${parts[0]} ${parts[1][0]}.`
			}
			return fullName
		}

		expect(formatUserName('Иван Иванов')).toBe('Иван И.')
		expect(formatUserName('John Doe')).toBe('John D.')
		expect(formatUserName('SingleName')).toBe('SingleName')
	})
})
