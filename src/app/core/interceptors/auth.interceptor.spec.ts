import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should send withCredentials and X-Comercio-ID for a non-admin role with a stored comercio', () => {
    localStorage.setItem('rol', 'GERENTE_TIENDA');
    localStorage.setItem('idComercio', '5');
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-Comercio-ID')).toBe('5');
    req.flush({});
  });

  it('should not add X-Comercio-ID for ADMIN_SISTEMA', () => {
    localStorage.setItem('rol', 'ADMIN_SISTEMA');
    localStorage.setItem('idComercio', '5');
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('X-Comercio-ID')).toBe(false);
    req.flush({});
  });

  it('should still send withCredentials for login requests without X-Comercio-ID', () => {
    http.post('/api/auth/login', {}).subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('X-Comercio-ID')).toBe(false);
    req.flush({});
  });

  it('should not add X-Comercio-ID when there is no stored session', () => {
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('X-Comercio-ID')).toBe(false);
    req.flush({});
  });
});
