import { HttpInterceptorFn } from '@angular/common/http';
import { decodeJwt, getIdComercioFromPayload, getRoleFromPayload } from '../utils/jwt.util';

const ADMIN_ROLE = 'ADMIN_SISTEMA';

/**
 * Interceptor HTTP global de seguridad y multi-tenant.
 *
 * Por cada petición saliente hacia el BFF:
 *  1. Inyecta 'Authorization: Bearer <token>' si hay sesión activa.
 *  2. Inyecta 'X-Comercio-ID' con el idComercio del claim del JWT, obligatorio
 *     para todo rol que NO sea ADMIN_SISTEMA (que opera de forma global/multi-tenant).
 *     Esta regla es la que evita los 403 de aislamiento tenant en el BFF.
 *
 * El login queda excluido: aún no existe token, y el BFF lo expone como público.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ss_token');

  if (!token || req.url.includes('/auth/login')) {
    return next(req);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };

  const payload = decodeJwt(token);
  const rol = getRoleFromPayload(payload);
  const idComercio = getIdComercioFromPayload(payload);

  if (rol !== ADMIN_ROLE && idComercio !== null) {
    headers['X-Comercio-ID'] = idComercio.toString();
  }

  return next(req.clone({ setHeaders: headers }));
};
