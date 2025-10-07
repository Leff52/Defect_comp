import { AuthService } from '../services/AuthService'

describe('AuthService', () => {
	describe('sign и verify', () => {
		it('должен подписывать и верифицировать JWT токен', () => {
			const payload = { id: '123', roles: ['Engineer'] }

			const token = AuthService.sign(payload)

			expect(token).toBeDefined()
			expect(typeof token).toBe('string')
			expect(token.split('.').length).toBe(3) 
		})

		it('должен правильно верифицировать валидный токен', () => {
			const payload = { id: '456', roles: ['Admin', 'Lead'] }
			const token = AuthService.sign(payload)

			const verified = AuthService.verify(token)

			expect(verified).toBeDefined()
			expect(verified.id).toBe('456')
			expect(verified.roles).toEqual(['Admin', 'Lead'])
		})

		it('должен выбросить ошибку для невалидного токена', () => {
			const invalidToken = 'invalid.token.here'

			expect(() => AuthService.verify(invalidToken)).toThrow()
		})

		it('должен создавать разные токены для разных пользователей', () => {
			const payload1 = { id: '1', roles: ['Engineer'] }
			const payload2 = { id: '2', roles: ['Manager'] }

			const token1 = AuthService.sign(payload1)
			const token2 = AuthService.sign(payload2)

			expect(token1).not.toBe(token2)
		})

		it('должен сохранять роли в токене', () => {
			const payload = { id: '789', roles: ['Engineer', 'Manager', 'Lead'] }
			const token = AuthService.sign(payload)

			const verified = AuthService.verify(token)

			expect(verified.roles).toHaveLength(3)
			expect(verified.roles).toContain('Engineer')
			expect(verified.roles).toContain('Manager')
			expect(verified.roles).toContain('Lead')
		})
	})
})
