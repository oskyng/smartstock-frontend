import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GerenciaService, AlertaAuditoria } from '../services/gerencia.service';
import { ApiService, CategoriaResponse } from '../../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../../shared/components/skeleton-rows/skeleton-rows.component';

interface Regla {
  id: number;
  nombre: string;
  diasCriticosMin: number;
  porcentajeDescuento: number;
  activa: boolean | number;
}

@Component({
  selector: 'app-dashboard-control',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, MatTableModule,
    MatChipsModule, MatDividerModule, MatTooltipModule, MatSelectModule, SkeletonRowsComponent
  ],
  templateUrl: './dashboard-control.component.html'
})
export class DashboardControlComponent implements OnInit {
  reglasForm: FormGroup;
  guardandoReglas = false;
  mensajeExitoReglas: string | null = null;
  mensajeErrorReglas: string | null = null;

  reglas: Regla[] = [];
  cargandoReglas = false;
  errorReglas: string | null = null;

  categorias: CategoriaResponse[] = [];
  cargandoCategorias = false;

  /** Solo las alertas vigentes en este momento (aún no resueltas), no el historial completo. */
  alertas: AlertaAuditoria[] = [];
  cargandoAlertas = true;
  mensajeErrorAlertas: string | null = null;

  constructor(
    private fb: FormBuilder,
    private gerenciaService: GerenciaService,
    private apiService: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.reglasForm = this.fb.group({
      idCategoria: [null, [Validators.required]],
      diasCriticosMin: [null, [Validators.required, Validators.min(1), Validators.max(365)]],
      porcentajeDescuento: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.cargarReglas();
    this.cargarCategorias();
    this.cargarAlertas();
  }

  /** Solo alertas activas en este momento (aún no resueltas): PENDIENTE u OMITIDA. */
  cargarAlertas(): void {
    this.cargandoAlertas = true;
    this.mensajeErrorAlertas = null;
    this.gerenciaService.obtenerAuditoriaAlertas().subscribe({
      next: (data) => {
        this.alertas = (Array.isArray(data) ? data : [])
          .filter(a => a.estadoAlerta === 'PENDIENTE' || a.estadoAlerta === 'OMITIDA');
        this.cargandoAlertas = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeErrorAlertas = err.error?.message ?? 'Error al cargar las alertas.';
        this.cargandoAlertas = false;
        this.cdr.markForCheck();
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.reglasForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.apiService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargandoCategorias = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoCategorias = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarReglas(): void {
    this.cargandoReglas = true;
    this.errorReglas = null;

    this.gerenciaService.obtenerReglas().subscribe({
      next: (data) => {
        this.reglas = data;
        this.cargandoReglas = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorReglas = err.error?.message ?? 'Error al cargar las reglas.';
        this.cargandoReglas = false;
        this.cdr.markForCheck();
      }
    });
  }

  crearRegla(): void {
    if (this.reglasForm.invalid) {
      this.reglasForm.markAllAsTouched();
      return;
    }

    this.guardandoReglas = true;
    this.mensajeExitoReglas = null;
    this.mensajeErrorReglas = null;

    this.gerenciaService.crearRegla(this.reglasForm.value).subscribe({
      next: () => {
        this.mensajeExitoReglas = 'Regla de depreciación creada correctamente.';
        this.toast.success(this.mensajeExitoReglas);
        this.reglasForm.reset();
        this.guardandoReglas = false;
        this.cargarReglas();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg: string = err.error?.message ?? 'Error al crear la regla.';
        this.mensajeErrorReglas = msg;
        this.toast.error(msg);
        this.guardandoReglas = false;
        this.cdr.markForCheck();
      }
    });
  }

  eliminarRegla(id: number): void {
    if (!confirm('¿Está seguro de eliminar esta regla?')) {
      return;
    }

    this.gerenciaService.eliminarRegla(id).subscribe({
      next: () => {
        this.toast.success('Regla eliminada exitosamente.');
        this.cargarReglas();
      },
      error: (err) => {
        const msg: string = err.error?.message ?? 'Error al eliminar la regla.';
        this.errorReglas = msg;
        this.toast.error(msg);
        this.cdr.markForCheck();
      }
    });
  }
}
