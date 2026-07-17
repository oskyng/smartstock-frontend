import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard de autorización por rol. Compara el rol guardado en el login (localStorage['rol'],
 * no el JWT en sí: la cookie httpOnly no es legible desde JS) contra `route.data['roles']`.
 * Si el usuario navega manualmente a una ruta que no le corresponde, lo redirige a 403.
 *
 * No valida expiración aquí (no hay claim 'exp' legible sin decodificar el token): si la cookie
 * expiró, la siguiente petición al backend recibe 401 y errorInterceptor cierra la sesión.
 */
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  const userRole = localStorage.getItem('rol');
  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/403-unauthorized']);
  return false;
};
