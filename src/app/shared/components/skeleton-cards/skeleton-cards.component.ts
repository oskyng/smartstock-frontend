import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Placeholders "shimmer" en formato tarjeta, para grids de cards (ej. bandeja de alertas)
 * mientras la petición HTTP al BFF está en tránsito.
 *
 * Uso:
 *   <app-skeleton-cards *ngIf="cargando" [count]="6"></app-skeleton-cards>
 */
@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Cargando contenido">
      <div *ngFor="let c of countArray" class="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="skeleton-block h-4 w-1/3"></span>
          <span class="skeleton-block h-5 w-16 rounded-full"></span>
        </div>
        <span class="skeleton-block h-3 w-full"></span>
        <span class="skeleton-block h-3 w-2/3"></span>
        <span class="skeleton-block h-9 w-full !rounded-xl mt-4"></span>
      </div>
    </div>
  `
})
export class SkeletonCardsComponent {
  @Input() count = 6;

  get countArray(): number[] {
    return Array.from({ length: this.count });
  }
}
