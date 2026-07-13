import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService, RolResponse, UsuarioResponse } from '../../core/services/usuario.service';
import { AdminService } from '../admin/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { getRoleLabel } from '../../core/utils/role-label.util';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

interface ComercioOption {
  id: number;
  razonSocial: string;
}

/** Roles que cada rol solicitante puede asignar o gestionar (espeja UsuarioService.validarJerarquia/validarAlcance en el backend). */
const ROLES_ASIGNABLES: Record<string, string[]> = {
  ADMIN_SISTEMA: ['ADMIN_SISTEMA', 'GERENTE_TIENDA', 'OPERADOR_INVENTARIO', 'REPONEDOR_SALA'],
  GERENTE_TIENDA: ['OPERADOR_INVENTARIO', 'REPONEDOR_SALA']
};

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule, SkeletonRowsComponent
  ],
  templateUrl: './crear-usuario.component.html'
})
export class CrearUsuarioComponent implements OnInit {
  readonly getRoleLabel = getRoleLabel;

  form: FormGroup;
  roles: RolResponse[] = [];
  comercios: ComercioOption[] = [];
  esAdmin = false;

  cargandoRoles = true;
  cargandoComercios = false;
  guardando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  usuarios: UsuarioResponse[] = [];
  cargandoUsuarios = true;
  errorUsuarios: string | null = null;

  editandoId: number | null = null;
  editForm: FormGroup;
  guardandoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private adminService: AdminService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.esAdmin = this.authService.getUser()?.rol === 'ADMIN_SISTEMA';
    this.form = this.fb.group({
      rut: ['', [Validators.required, Validators.maxLength(12)]],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      idRol: [null, Validators.required],
      idComercio: [null]
    });
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      idRol: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
    if (this.esAdmin) {
      this.cargarComercios();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  isEditInvalid(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /** Un GERENTE_TIENDA solo puede editar/eliminar usuarios OPERADOR_INVENTARIO/REPONEDOR_SALA (espeja el backend). */
  puedeGestionar(usuario: UsuarioResponse): boolean {
    if (this.esAdmin) {
      return true;
    }
    return ROLES_ASIGNABLES['GERENTE_TIENDA'].includes(usuario.rol);
  }

  cargarRoles(): void {
    this.cargandoRoles = true;
    this.usuarioService.listarRoles().subscribe({
      next: (data) => {
        const rolSolicitante = this.authService.getUser()?.rol ?? '';
        const permitidos = ROLES_ASIGNABLES[rolSolicitante] ?? [];
        this.roles = data.filter(r => permitidos.includes(r.nombre));
        this.cargandoRoles = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el catálogo de roles.';
        this.toast.error(this.mensajeError);
        this.cargandoRoles = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarComercios(): void {
    this.cargandoComercios = true;
    this.adminService.obtenerComercios().subscribe({
      next: (data) => {
        this.comercios = Array.isArray(data) ? data : [];
        this.cargandoComercios = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoComercios = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.errorUsuarios = null;
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = Array.isArray(data) ? data : [];
        this.cargandoUsuarios = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorUsuarios = 'No se pudo cargar el listado de usuarios.';
        this.cargandoUsuarios = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    const { rut, nombre, apellido, email, password, idRol, idComercio } = this.form.value;
    this.usuarioService.crearUsuario({
      rut,
      nombre,
      apellido,
      email,
      password,
      idRol,
      // Para GERENTE_TIENDA el backend ignora idComercio y fuerza el comercio del solicitante.
      idComercio: this.esAdmin ? idComercio : null
    }).subscribe({
      next: (res) => {
        this.mensajeExito = `Usuario "${res.usuario.email}" creado exitosamente como ${getRoleLabel(res.usuario.rol)}.`;
        this.toast.success(this.mensajeExito);
        this.form.reset();
        this.guardando = false;
        this.cargarUsuarios();
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        const msg: string = err.error?.message || 'Error al crear el usuario.';
        this.mensajeError = msg;
        this.toast.error(msg);
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  iniciarEdicion(usuario: UsuarioResponse): void {
    this.editandoId = usuario.id;
    this.editForm.setValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      idRol: this.roles.find(r => r.nombre === usuario.rol)?.id ?? null
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editForm.reset();
  }

  guardarEdicion(id: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardandoEdicion = true;
    this.usuarioService.actualizarUsuario(id, this.editForm.value).subscribe({
      next: () => {
        this.toast.success('Usuario actualizado exitosamente.');
        this.guardandoEdicion = false;
        this.editandoId = null;
        this.cargarUsuarios();
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        const msg: string = err.error?.message || 'Error al actualizar el usuario.';
        this.toast.error(msg);
        this.guardandoEdicion = false;
        this.cdr.markForCheck();
      }
    });
  }

  eliminarUsuario(usuario: UsuarioResponse): void {
    if (!confirm(`¿Está seguro de desactivar al usuario "${usuario.email}"?`)) {
      return;
    }
    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.toast.success('Usuario desactivado exitosamente.');
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        const msg: string = err.error?.message || 'Error al desactivar el usuario.';
        this.toast.error(msg);
        this.cdr.markForCheck();
      }
    });
  }
}
