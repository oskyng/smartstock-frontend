import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatListModule, HasRoleDirective],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  /** Emite al hacer click en cualquier link (usado para cerrar el drawer en mobile). */
  @Output() navigate = new EventEmitter<void>();

  onLinkClick(): void {
    this.navigate.emit();
  }
}
