import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: any;
  let authService: any;

  beforeEach(async () => {
    router = { navigate: vi.fn() };
    authService = {
      login: vi.fn().mockReturnValue(of({ token: 'abc', email: 'test@test.com', rol: 'ADMIN' }))
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on login', () => {
    component.email = 'test@test.com';
    component.password = '123456';
    component.onLogin();
    expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123456' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate GERENTE_TIENDA to /dashboard on login', () => {
    authService.login.mockReturnValue(of({ token: 'abc', email: 'gerente@test.com', rol: 'GERENTE_TIENDA' }));
    component.email = 'gerente@test.com';
    component.password = '123456';
    component.onLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on login failure with 403', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 403, error: { message: 'Bad credentials' } })));
    component.email = 'bad@test.com';
    component.password = 'wrong';
    component.onLogin();
    expect(component.errorMessage).toBe('Bad credentials');
    expect(component.loading).toBe(false);
  });

  it('should set default error message when no message in 401 error', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 401, error: {} })));
    component.email = 'bad@test.com';
    component.password = 'wrong';
    component.onLogin();
    expect(component.errorMessage).toBe('Credenciales inv\u00e1lidas. Intente nuevamente.');
  });

  it('should show connection error when status is 0', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 0 })));
    component.email = 'test@test.com';
    component.password = '123';
    component.onLogin();
    expect(component.errorMessage).toBe('No se pudo conectar con el servidor. Verifique su conexi\u00f3n.');
  });

  it('should show server error when status >= 500', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 500 })));
    component.email = 'test@test.com';
    component.password = '123';
    component.onLogin();
    expect(component.errorMessage).toBe('Error interno del servidor. Intente m\u00e1s tarde.');
  });

  it('should show validation error when fields are empty', () => {
    component.email = '';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('Debe ingresar su email y contrase\u00f1a.');
    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
