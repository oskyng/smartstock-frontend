import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeJwt, getRoleFromPayload, isTokenExpired } from '../utils/jwt.util';

/**
 * Guard de autorización por rol. Lee el claim 'rol' del JWT (sin prefijo ROLE_)
 * y lo compara contra `route.data['roles']`. Si el usuario navega manualmente
 * a una ruta que no le corresponde, lo redirige a la página de 403.
 */
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  const token = localStorage.getItem('ss_token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = getRoleFromPayload(payload);

  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/403-unauthorized']);
  return false;
};
