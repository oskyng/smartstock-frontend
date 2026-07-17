import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, DashboardResponse, ProductoResponse, LoteResponse, AlertaResponse, ReglaDepreciacionResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

export interface RiesgoCategoria {
  categoria: string;
  valor: number;
  porcentaje: number;
}

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
  /** Capital comprometido (cantidad x precio dinámico) de lotes en riesgo, agrupado por categoría real. */
  riesgoPorCategoria: RiesgoCategoria[] = [];
  /** Capital en riesgo real (cantidad x costo), calculado en el backend. */
  capitalEnRiesgo = 0;
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
        const reglas = Array.isArray(data.reglasActivas) ? data.reglasActivas : [];
        this.totalProductos = this.productos.length;
        this.totalLotesCriticos = this.lotes.filter(l => this.esLoteEnRiesgo(l, reglas)).length;
        this.alertasPendientes = this.alertas.filter(a => a.estado === 'PENDIENTE').length;
        this.riesgoPorCategoria = this.calcularRiesgoPorCategoria(this.lotes, reglas);
        this.capitalEnRiesgo = data.capitalEnRiesgo ?? 0;
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

  /**
   * Un lote está "en riesgo" si sus días restantes para vencer ya cruzaron el umbral crítico de
   * alguna regla de depreciación activa de su categoría — el mismo criterio que dispara los
   * descuentos automáticos y el cálculo de Capital en Riesgo en el backend. `estadoLote` no sirve
   * para esto: el backend nunca lo transiciona a un valor distinto de "DISPONIBLE".
   */
  private esLoteEnRiesgo(lote: LoteResponse, reglas: ReglaDepreciacionResponse[]): boolean {
    if (!lote.fechaVencimiento) {
      return false;
    }
    const diasParaVencer = Math.ceil((new Date(lote.fechaVencimiento).getTime() - Date.now()) / 86_400_000);
    return reglas.some(r =>
      !!r.activa &&
      r.nombreCategoria === lote.nombreCategoria &&
      diasParaVencer <= r.diasCriticosMin
    );
  }

  /** Suma cantidadActual x precioDinamico de lotes en riesgo, agrupada por categoría real del producto. */
  private calcularRiesgoPorCategoria(lotes: LoteResponse[], reglas: ReglaDepreciacionResponse[]): RiesgoCategoria[] {
    const valorPorCategoria = new Map<string, number>();
    for (const lote of lotes) {
      if (!this.esLoteEnRiesgo(lote, reglas)) {
        continue;
      }
      const categoria = lote.nombreCategoria || 'Sin categoría';
      const valor = (lote.cantidadActual ?? 0) * (lote.precioDinamico ?? 0);
      valorPorCategoria.set(categoria, (valorPorCategoria.get(categoria) ?? 0) + valor);
    }

    const entradas = Array.from(valorPorCategoria, ([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
    const maximo = entradas.length > 0 ? entradas[0].valor : 0;

    return entradas.map(e => ({
      ...e,
      porcentaje: maximo > 0 ? Math.round((e.valor / maximo) * 100) : 0
    }));
  }
}
