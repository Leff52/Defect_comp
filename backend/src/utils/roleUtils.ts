/**
 * Утилиты для работы с ролями пользователей
 */

/**
 * Нормализует роли пользователя в массив строк
 * @param roles - роли пользователя (массив или строка)
 * @returns Отфильтрованный массив строк ролей
 */
export function normalizeRoles(roles: unknown): string[] {
  if (Array.isArray(roles)) {
    return roles.filter(role => typeof role === 'string' && role.trim().length > 0);
  }
  
  if (typeof roles === 'string' && roles.trim().length > 0) {
    return [roles.trim()];
  }
  
  return [];
}

/**
 * Проверяет, имеет ли пользователь хотя бы одну из указанных ролей
 * @param userRoles - роли пользователя
 * @param requiredRoles - требуемые роли
 * @returns true, если пользователь имеет хотя бы одну из требуемых ролей
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}

/**
 * Проверяет, имеет ли пользователь все указанные роли
 * @param userRoles - роли пользователя
 * @param requiredRoles - требуемые роли
 * @returns true, если пользователь имеет все требуемые роли
 */
export function hasAllRoles(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}