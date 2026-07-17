import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP global de errores.
 *  - 401: sesión inválida/expirada -> limpia el storage y redirige a /login.
 *  - 403: sin permisos o conflicto de comercio (X-Comercio-ID no coincide) -> notifica al usuario.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isLoginRequest = req.url.includes('/auth/login');

        if (error.status === 401 && !isLoginRequest) {
          // Vía authService.logout() (no limpieza manual de localStorage) para que loggedIn$
          // quede sincronizado con el estado real de la sesión.
          authService.logout();
          toast.error('Tu sesión expiró o no es válida. Inicia sesión nuevamente.');
          router.navigate(['/login']);
        } else if (error.status === 403) {
          const backendMessage = error.error?.error || error.error?.message;
          toast.error(backendMessage || 'No tienes permisos para realizar esta acción o hay un conflicto de comercio.');
        }
      }

      return throwError(() => error);
    })
  );
};
