import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

interface Comercio {
  id: number;
  rutEmpresa: string;
  razonSocial: string;
  rubro: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-admin.component.html'
})
export class DashboardAdminComponent implements OnInit {
  comercioForm: FormGroup;
  guardando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  comerciosActivos: Comercio[] = [];
  cargandoComercios = false;
  errorComercios: string | null = null;

  editandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.comercioForm = this.fb.group({
      rutEmpresa: ['', [Validators.required, Validators.maxLength(12)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(150)]],
      rubro: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.cargarComerciosActivos();
  }

  registrarComercio(): void {
    if (this.comercioForm.invalid) {
      this.comercioForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    if (this.editandoId !== null) {
      this.adminService.actualizarComercio(this.editandoId, this.comercioForm.value).subscribe({
        next: () => {
          this.mensajeExito = 'Comercio actualizado exitosamente.';
          this.toast.success(this.mensajeExito);
          this.comercioForm.reset();
          this.editandoId = null;
          this.guardando = false;
          this.cargarComerciosActivos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          const msg: string = err.error?.message || 'Error al actualizar el comercio.';
          this.mensajeError = msg;
          this.toast.error(msg);
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.adminService.registrarComercio(this.comercioForm.value).subscribe({
        next: () => {
          this.mensajeExito = 'Comercio registrado exitosamente en la plataforma.';
          this.toast.success(this.mensajeExito);
          this.comercioForm.reset();
          this.guardando = false;
          this.cargarComerciosActivos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          const msg: string = err.error?.message || 'Error al registrar el comercio.';
          this.mensajeError = msg;
          this.toast.error(msg);
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  editarComercio(comercio: Comercio): void {
    this.editandoId = comercio.id;
    this.comercioForm.patchValue({
      rutEmpresa: comercio.rutEmpresa,
      razonSocial: comercio.razonSocial,
      rubro: comercio.rubro
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.comercioForm.reset();
  }

  eliminarComercio(id: number): void {
    if (!confirm('¿Está seguro de eliminar este comercio?')) {
      return;
    }

    this.adminService.eliminarComercio(id).subscribe({
      next: () => {
        this.toast.success('Comercio eliminado exitosamente.');
        this.cargarComerciosActivos();
      },
      error: (err) => {
        const msg: string = err.error?.message || 'Error al eliminar el comercio.';
        this.errorComercios = msg;
        this.toast.error(msg);
        this.cdr.markForCheck();
      }
    });
  }

  cargarComerciosActivos(): void {
    this.cargandoComercios = true;
    this.errorComercios = null;

    this.adminService.obtenerComercios().subscribe({
      next: (data) => {
        this.comerciosActivos = data;
        this.cargandoComercios = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorComercios = err.error?.message || 'Error al cargar los comercios activos.';
        this.cargandoComercios = false;
        this.cdr.markForCheck();
      }
    });
  }
}
