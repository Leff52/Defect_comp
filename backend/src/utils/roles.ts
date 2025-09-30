// src/utils/roles.ts
export const toRoleArray = (val: unknown): string[] =>
	Array.isArray(val) ? val.filter(Boolean) :
	typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) :
	[];
