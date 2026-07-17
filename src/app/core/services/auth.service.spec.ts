import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should POST with credentials and store only non-sensitive user metadata (never the token)', () => {
    // El backend ya no devuelve el JWT en el body (viaja en una cookie httpOnly, ver
    // BffController.login): el body de éxito solo trae email/rol/idComercio.
    const mockRes = { email: 'test@test.com', rol: 'ADMIN', idComercio: null };
    service.login({ email: 'test@test.com', password: '123' }).subscribe(res => {
      expect(res).toEqual(mockRes);
    });
    const req = httpMock.expectOne(`${API}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockRes);

    expect(localStorage.getItem('ss_token')).toBeNull();
    expect(JSON.parse(localStorage.getItem('ss_user')!)).toEqual({ email: 'test@test.com', rol: 'ADMIN', idComercio: null });
  });

  it('logout should clear storage and ask the backend to invalidate the cookie', () => {
    localStorage.setItem('ss_user', '{}');
    localStorage.setItem('rol', 'ADMIN');
    localStorage.setItem('idComercio', '1');

    service.logout();

    const req = httpMock.expectOne(`${API}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});

    expect(localStorage.getItem('ss_user')).toBeNull();
    expect(localStorage.getItem('rol')).toBeNull();
    expect(localStorage.getItem('idComercio')).toBeNull();
  });

  it('logout should still clear local storage even if the backend call fails', () => {
    localStorage.setItem('ss_user', '{}');

    service.logout();

    const req = httpMock.expectOne(`${API}/auth/logout`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(localStorage.getItem('ss_user')).toBeNull();
  });

  it('getUser should return parsed user or null', () => {
    expect(service.getUser()).toBeNull();
    localStorage.setItem('ss_user', JSON.stringify({ email: 'a@b.com', rol: 'USER' }));
    expect(service.getUser()).toEqual({ email: 'a@b.com', rol: 'USER', idComercio: null });
  });

  it('getRoleLabel should return a human-readable label for known roles', () => {
    localStorage.setItem('ss_user', JSON.stringify({ email: 'g@b.com', rol: 'GERENTE_TIENDA' }));
    expect(service.getRoleLabel()).toBe('Gerente de Tienda');
  });

  it('getComercioLabel should reflect idComercio or global access', () => {
    localStorage.setItem('ss_user', JSON.stringify({ email: 'a@b.com', rol: 'ADMIN_SISTEMA', idComercio: null }));
    expect(service.getComercioLabel()).toBe('Acceso Global');

    localStorage.setItem('ss_user', JSON.stringify({ email: 'g@b.com', rol: 'GERENTE_TIENDA', idComercio: 3 }));
    expect(service.getComercioLabel()).toBe('Comercio #3');
  });

  it('isLoggedIn should reflect stored session metadata (the token itself is an httpOnly cookie, unreadable from JS)', () => {
    expect(service.isLoggedIn()).toBe(false);
    localStorage.setItem('ss_user', '{"email":"a@b.com","rol":"ADMIN","idComercio":null}');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isLoggedIn$ should emit values', () => {
    let val: boolean | undefined;
    service.isLoggedIn$().subscribe(v => val = v);
    expect(val).toBe(false);
  });
});
