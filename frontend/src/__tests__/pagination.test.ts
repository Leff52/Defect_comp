describe('Утилиты пагинации', () => {
	it('должен вычислять offset для пагинации', () => {
		const calculateOffset = (page: number, limit: number): number => {
			return (page - 1) * limit
		}

		expect(calculateOffset(1, 10)).toBe(0)
		expect(calculateOffset(2, 10)).toBe(10)
		expect(calculateOffset(3, 20)).toBe(40)
	})

	it('должен вычислять общее количество страниц', () => {
		const calculateTotalPages = (total: number, limit: number): number => {
			return Math.ceil(total / limit)
		}

		expect(calculateTotalPages(100, 10)).toBe(10)
		expect(calculateTotalPages(95, 10)).toBe(10)
		expect(calculateTotalPages(5, 10)).toBe(1)
		expect(calculateTotalPages(0, 10)).toBe(0)
	})

	it('должен проверять валидность номера страницы', () => {
		const isValidPage = (page: number, totalPages: number): boolean => {
			return page >= 1 && page <= totalPages
		}

		expect(isValidPage(1, 10)).toBe(true)
		expect(isValidPage(10, 10)).toBe(true)
		expect(isValidPage(0, 10)).toBe(false)
		expect(isValidPage(11, 10)).toBe(false)
	})

	it('должен генерировать массив номеров страниц', () => {
		const generatePageNumbers = (totalPages: number): number[] => {
			return Array.from({ length: totalPages }, (_, i) => i + 1)
		}

		expect(generatePageNumbers(5)).toEqual([1, 2, 3, 4, 5])
		expect(generatePageNumbers(3)).toEqual([1, 2, 3])
		expect(generatePageNumbers(1)).toEqual([1])
	})
})
