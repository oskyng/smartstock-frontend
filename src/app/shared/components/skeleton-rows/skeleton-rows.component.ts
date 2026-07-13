import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Filas "shimmer" de placeholder para estados de carga de tablas y listas
 * (evita el salto brusco de un spinner centrado a contenido real).
 *
 * Uso:
 *   <app-skeleton-rows *ngIf="cargando" [rows]="5" [columns]="4"></app-skeleton-rows>
 */
@Component({
  selector: 'app-skeleton-rows',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="divide-y divide-gray-100" role="status" aria-label="Cargando contenido">
      <div *ngFor="let r of rowsArray" class="flex items-center gap-4 px-6 py-4">
        <span *ngFor="let c of columnsArray; let first = first"
              class="skeleton-block h-3"
              [class.w-1/4]="first"
              [class.w-1/6]="!first"></span>
      </div>
    </div>
  `
})
export class SkeletonRowsComponent {
  @Input() rows = 4;
  @Input() columns = 4;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows });
  }

  get columnsArray(): number[] {
    return Array.from({ length: this.columns });
  }
}
