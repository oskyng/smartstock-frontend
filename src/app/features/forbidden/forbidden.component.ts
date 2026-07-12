import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './forbidden.component.html'
})
export class ForbiddenComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  volverAMiPanel(): void {
    const user = this.authService.getUser();
    this.router.navigate([this.dashboardPorRol(user?.rol)]);
  }

  private dashboardPorRol(rol?: string): string {
    switch (rol) {
      case 'ADMIN_SISTEMA':
        return '/admin/dashboard';
      case 'GERENTE_TIENDA':
        return '/gerencia/dashboard';
      case 'OPERADOR_INVENTARIO':
        return '/inventario/ingreso';
      case 'REPONEDOR_SALA':
        return '/alertas/bandeja';
      default:
        return '/dashboard';
    }
  }
}
