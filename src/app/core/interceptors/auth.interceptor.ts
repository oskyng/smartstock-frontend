import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ss_token');

  if (token && !req.url.includes('/auth/login')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Comercio-ID': '1'
      }
    });
    return next(cloned);
  }

  return next(req);
};
