import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Debe ingresar su email y contraseña.';
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        const rol = res.rol;
        switch (rol) {
          case 'ADMIN_SISTEMA':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'GERENTE_TIENDA':
            this.router.navigate(['/dashboard']);
            break;
          case 'OPERADOR_INVENTARIO':
            this.router.navigate(['/inventario/ingreso']);
            break;
          case 'REPONEDOR_SALA':
            this.router.navigate(['/alertas/bandeja']);
            break;
          default:
            this.router.navigate(['/dashboard']);
            break;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = err.error?.message || 'Credenciales inválidas. Intente nuevamente.';
        } else if (err.status >= 500) {
          this.errorMessage = 'Error interno del servidor. Intente más tarde.';
        } else {
          this.errorMessage = err.error?.message || 'Ocurrió un error inesperado. Intente nuevamente.';
        }
        this.cdr.markForCheck();
      }
    });
  }
}
