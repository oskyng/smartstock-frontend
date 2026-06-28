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

  it('should set error message on login failure', () => {
    authService.login.mockReturnValue(throwError(() => ({ error: { message: 'Bad credentials' } })));
    component.email = 'bad@test.com';
    component.password = 'wrong';
    component.onLogin();
    expect(component.errorMessage).toBe('Bad credentials');
    expect(component.loading).toBe(false);
  });

  it('should set default error message when no message in error', () => {
    authService.login.mockReturnValue(throwError(() => ({ error: {} })));
    component.onLogin();
    expect(component.errorMessage).toBe('Credenciales inv\u00e1lidas. Intente nuevamente.');
  });
});
