import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, DashboardResponse, ProductoResponse, LoteResponse, AlertaResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatIconModule, MatTableModule, MatChipsModule,
    MatProgressSpinnerModule, MatButtonModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  productos: ProductoResponse[] = [];
  lotes: LoteResponse[] = [];
  alertas: AlertaResponse[] = [];
  totalProductos = 0;
  totalLotesCriticos = 0;
  alertasPendientes = 0;
  loading = true;
  error = '';
  today = new Date();

  constructor(
    private apiService: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getDashboard().subscribe({
      next: (data: DashboardResponse) => {
        this.productos = Array.isArray(data.productos) ? data.productos : [];
        this.lotes = Array.isArray(data.lotesRecientes) ? data.lotesRecientes : [];
        this.alertas = Array.isArray(data.alertasPendientes) ? data.alertasPendientes : [];
        this.totalProductos = this.productos.length;
        this.totalLotesCriticos = this.lotes.filter(l => l.estadoLote === 'CRITICO' || l.estadoLote === 'POR_VENCER').length;
        this.alertasPendientes = this.alertas.filter(a => a.estado === 'PENDIENTE').length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar el dashboard.';
        this.toast.error(this.error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
