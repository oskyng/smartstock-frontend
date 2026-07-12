import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from './services/admin.service';
import { ToastService } from '../../core/services/toast.service';
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
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

interface Comercio {
  id: number;
  rutEmpresa: string;
  razonSocial: string;
  rubro: string;
}

@Component({
  selector: 'app-admin-global',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './admin-global.component.html'
})
export class AdminGlobalComponent implements OnInit {
  comercios: Comercio[] = [];
  loading = true;
  error = '';
  comercioForm: FormGroup;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  editandoId: number | null = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.comercioForm = this.fb.group({
      rutEmpresa: ['', [Validators.required, Validators.maxLength(12)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(150)]],
      rubro: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.comercioForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  ngOnInit() {
    this.loadComercios();
  }

  loadComercios() {
    this.loading = true;
    this.adminService.obtenerComercios().subscribe({
      next: (data) => {
        this.comercios = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar comercios.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  guardarComercio() {
    if (this.comercioForm.invalid) {
      this.comercioForm.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.editandoId !== null) {
      this.adminService.actualizarComercio(this.editandoId, this.comercioForm.value).subscribe({
        next: () => {
          this.mensajeExito = 'Comercio actualizado exitosamente.';
          this.toast.success(this.mensajeExito);
          this.comercioForm.reset();
          this.editandoId = null;
          this.guardando = false;
          this.loadComercios();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al actualizar el comercio.';
          this.toast.error(this.mensajeError);
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.adminService.registrarComercio(this.comercioForm.value).subscribe({
        next: () => {
          this.mensajeExito = 'Comercio registrado exitosamente.';
          this.toast.success(this.mensajeExito);
          this.comercioForm.reset();
          this.guardando = false;
          this.loadComercios();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al registrar el comercio.';
          this.toast.error(this.mensajeError);
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  editarComercio(comercio: Comercio) {
    this.editandoId = comercio.id;
    this.comercioForm.patchValue({
      rutEmpresa: comercio.rutEmpresa,
      razonSocial: comercio.razonSocial,
      rubro: comercio.rubro
    });
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.comercioForm.reset();
  }

  eliminarComercio(id: number) {
    if (!confirm('¿Está seguro de eliminar este comercio?')) {
      return;
    }
    this.adminService.eliminarComercio(id).subscribe({
      next: () => {
        this.toast.success('Comercio eliminado exitosamente.');
        this.loadComercios();
      },
      error: () => {
        this.toast.error('Error al eliminar el comercio.');
        this.cdr.markForCheck();
      }
    });
  }
}
