export function toRoleArray(input: unknown): string[] {
	if (Array.isArray(input)) return input.filter(Boolean) as string[]
	if (typeof input === 'string') {
		return input
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)
	}
	if (input && typeof input === 'object' && 'roles' in (input as any)) {
		return toRoleArray((input as any).roles)
	}
	return []
}
