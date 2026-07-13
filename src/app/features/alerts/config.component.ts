import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, CategoriaResponse, ReglaDepreciacionResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './config.component.html'
})
export class ConfigComponent implements OnInit {
  rules: ReglaDepreciacionResponse[] = [];
  loading = true;
  error = '';
  reglaForm: FormGroup;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  categorias: CategoriaResponse[] = [];
  cargandoCategorias = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.reglaForm = this.fb.group({
      idCategoria: [null, [Validators.required]],
      diasCriticosMin: [null, [Validators.required, Validators.min(1), Validators.max(365)]],
      porcentajeDescuento: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadReglas();
    this.loadCategorias();
  }

  loadCategorias() {
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

  isInvalid(controlName: string): boolean {
    const control = this.reglaForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  loadReglas() {
    this.loading = true;
    this.apiService.getReglas().subscribe({
      next: (data) => {
        this.rules = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar reglas de depreciación.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  crearRegla() {
    if (this.reglaForm.invalid) {
      this.reglaForm.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.apiService.crearRegla(this.reglaForm.value).subscribe({
      next: () => {
        this.mensajeExito = 'Regla creada exitosamente.';
        this.toast.success(this.mensajeExito);
        this.reglaForm.reset();
        this.guardando = false;
        this.loadReglas();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al crear la regla.';
        this.toast.error(this.mensajeError);
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  eliminarRegla(id: number) {
    if (!confirm('¿Está seguro de eliminar esta regla?')) {
      return;
    }
    this.apiService.eliminarRegla(id).subscribe({
      next: () => {
        this.toast.success('Regla eliminada exitosamente.');
        this.loadReglas();
      },
      error: () => {
        this.toast.error('Error al eliminar la regla.');
        this.cdr.markForCheck();
      }
    });
  }
}
