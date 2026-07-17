import { HttpInterceptorFn } from '@angular/common/http';

const ADMIN_ROLE = 'ADMIN_SISTEMA';

/**
 * Interceptor HTTP global de seguridad y multi-tenant.
 *
 * Por cada petición saliente hacia el BFF:
 *  1. Adjunta `withCredentials` para que el navegador envíe la cookie httpOnly de sesión
 *     (el JWT ya no es legible desde JS, ver AuthService/BffController.login).
 *  2. Inyecta 'X-Comercio-ID' con el idComercio guardado en el login, obligatorio
 *     para todo rol que NO sea ADMIN_SISTEMA (que opera de forma global/multi-tenant).
 *     Esta regla es la que evita los 403 de aislamiento tenant en el BFF.
 *
 * El login/logout quedan excluidos del header X-Comercio-ID (aún no hay sesión), pero igual
 * necesitan `withCredentials` para poder recibir/enviar la cookie.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const withCreds = req.clone({ withCredentials: true });

  if (req.url.includes('/auth/login') || req.url.includes('/auth/logout')) {
    return next(withCreds);
  }

  const rol = localStorage.getItem('rol');
  const idComercio = localStorage.getItem('idComercio');

  if (rol !== ADMIN_ROLE && idComercio) {
    return next(withCreds.clone({ setHeaders: { 'X-Comercio-ID': idComercio } }));
  }

  return next(withCreds);
};
