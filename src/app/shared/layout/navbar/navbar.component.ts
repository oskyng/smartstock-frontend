import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatBadgeModule, MatInputModule, MatFormFieldModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  userEmail = '';

  constructor(private router: Router, private authService: AuthService) {
    const user = this.authService.getUser();
    this.userEmail = user?.email || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
