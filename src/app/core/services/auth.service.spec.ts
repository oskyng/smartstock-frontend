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

  it('login should POST and store token/user', () => {
    const mockRes = { token: 'abc123', email: 'test@test.com', rol: 'ADMIN' };
    service.login({ email: 'test@test.com', password: '123' }).subscribe(res => {
      expect(res).toEqual(mockRes);
    });
    const req = httpMock.expectOne(`${API}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);

    expect(localStorage.getItem('ss_token')).toBe('abc123');
    expect(JSON.parse(localStorage.getItem('ss_user')!)).toEqual({ email: 'test@test.com', rol: 'ADMIN' });
  });

  it('logout should clear storage', () => {
    localStorage.setItem('ss_token', 'tok');
    localStorage.setItem('ss_user', '{}');
    service.logout();
    expect(localStorage.getItem('ss_token')).toBeNull();
    expect(localStorage.getItem('ss_user')).toBeNull();
  });

  it('getToken should return token from storage', () => {
    expect(service.getToken()).toBeNull();
    localStorage.setItem('ss_token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });

  it('getUser should return parsed user or null', () => {
    expect(service.getUser()).toBeNull();
    localStorage.setItem('ss_user', JSON.stringify({ email: 'a@b.com', rol: 'USER' }));
    expect(service.getUser()).toEqual({ email: 'a@b.com', rol: 'USER' });
  });

  it('isLoggedIn should reflect token presence', () => {
    expect(service.isLoggedIn()).toBe(false);
    localStorage.setItem('ss_token', 'tok');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isLoggedIn$ should emit values', () => {
    let val: boolean | undefined;
    service.isLoggedIn$().subscribe(v => val = v);
    expect(val).toBe(false);
  });
});
