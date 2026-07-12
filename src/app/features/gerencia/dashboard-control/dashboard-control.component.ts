import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GerenciaService } from '../services/gerencia.service';
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
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../../shared/components/skeleton-rows/skeleton-rows.component';

interface Regla {
  id: number;
  nombre: string;
  diasCriticosMin: number;
  porcentajeDescuento: number;
  activa: boolean | number;
}

interface Alerta {
  id: number;
  mensaje: string;
  rolAsignado: string;
  fechaLimite: string;
  estado: string;
  fechaCreacion: string;
}

@Component({
  selector: 'app-dashboard-control',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, MatTableModule,
    MatChipsModule, MatDividerModule, MatTooltipModule, SkeletonRowsComponent
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

  alertas: Alerta[] = [];
  cargandoAlertas = false;
  mensajeErrorAlertas: string | null = null;
  /** GET /alertas es exclusivo del rol REPONEDOR_SALA en el BFF; GERENTE_TIENDA no tiene acceso por diseño. */
  alertasNoDisponibles = false;

  constructor(
    private fb: FormBuilder,
    private gerenciaService: GerenciaService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.reglasForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      diasCriticosMin: [null, [Validators.required, Validators.min(1), Validators.max(365)]],
      porcentajeDescuento: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarReglas();
    // GET /api/v1/bff/alertas es exclusivo del rol REPONEDOR_SALA en el BFF (por diseño);
    // para GERENTE_TIENDA siempre resulta en 403, así que no se solicita.
    this.alertasNoDisponibles = true;
  }

  isInvalid(controlName: string): boolean {
    const control = this.reglasForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
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
        this.reglasForm.reset({ activa: true });
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
