import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: any;
  let toastService: any;
  let router: any;

  beforeEach(() => {
    authService = { logout: vi.fn() };
    toastService = { error: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should log out and redirect to /login on a 401 from a non-login request', () => {
    http.get('/api/v1/bff/dashboard').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/v1/bff/dashboard');
    req.flush({ message: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
    expect(toastService.error).toHaveBeenCalledWith('Tu sesión expiró o no es válida. Inicia sesión nuevamente.');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not log out on a 401 from the login request itself', () => {
    http.post('/api/v1/bff/auth/login', {}).subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/v1/bff/auth/login');
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show a toast with the backend message on 403 without logging out', () => {
    http.get('/api/v1/bff/usuarios').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/v1/bff/usuarios');
    req.flush({ message: 'No tiene permisos suficientes' }, { status: 403, statusText: 'Forbidden' });

    expect(toastService.error).toHaveBeenCalledWith('No tiene permisos suficientes');
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
