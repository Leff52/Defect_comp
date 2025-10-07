const nextJest = require('next/jest')

const createJestConfig = nextJest({
	dir: './',
})

const config = {
	coverageProvider: 'v8',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	testMatch: [
		'**/__tests__/**/*.{ts,tsx}',
		'**/?(*.)+(spec|test).{ts,tsx}',
	],
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*.stories.{ts,tsx}',
	],
}

module.exports = createJestConfig(config)
