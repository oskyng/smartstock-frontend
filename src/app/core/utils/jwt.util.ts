/** Normaliza un rol quitándole el prefijo 'ROLE_' si lo trae (para comparar contra el claim crudo). */
export function stripRolePrefix(role: string): string {
  return role.replace(/^ROLE_/, '');
}
