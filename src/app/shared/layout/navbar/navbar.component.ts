import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTooltipModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  /** Emite cuando el usuario toca el botón hamburguesa (solo visible en mobile). */
  @Output() menuToggle = new EventEmitter<void>();

  userEmail = '';
  roleLabel = '';
  comercioLabel = '';

  constructor(private router: Router, private authService: AuthService) {
    const user = this.authService.getUser();
    this.userEmail = user?.email || '';
    this.roleLabel = this.authService.getRoleLabel();
    this.comercioLabel = this.authService.getComercioLabel();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
