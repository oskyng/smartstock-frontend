export interface JwtPayload {
  sub?: string;
  rol?: string;
  idComercio?: number | string | null;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica el payload de un JWT sin validar la firma (solo lectura en cliente).
 * Soporta Base64URL (reemplaza -/_ antes de decodificar) y caracteres UTF-8.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Devuelve el rol del token SIN el prefijo 'ROLE_' (el claim del backend nunca lo trae). */
export function getRoleFromPayload(payload: JwtPayload | null): string {
  if (!payload?.rol) {
    return '';
  }
  return payload.rol.toString().replace(/^ROLE_/, '');
}

/** Devuelve el idComercio del token, o null si no aplica (ej. ADMIN_SISTEMA). */
export function getIdComercioFromPayload(payload: JwtPayload | null): number | null {
  const raw = payload?.idComercio;
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

/** true si el token ya expiró según su claim 'exp' (segundos epoch). */
export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) {
    return false;
  }
  return Date.now() >= payload.exp * 1000;
}

/** Normaliza un rol quitándole el prefijo 'ROLE_' si lo trae (para comparar contra el claim crudo). */
export function stripRolePrefix(role: string): string {
  return role.replace(/^ROLE_/, '');
}
