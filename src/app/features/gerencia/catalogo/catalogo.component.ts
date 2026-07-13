import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, CategoriaResponse, ProveedorResponse } from '../../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../../shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    SkeletonRowsComponent
  ],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  activeTab: 'categorias' | 'proveedores' = 'categorias';

  categorias: CategoriaResponse[] = [];
  loadingCategorias = true;
  errorCategorias = '';
  categoriaForm: FormGroup;
  guardandoCategoria = false;

  proveedores: ProveedorResponse[] = [];
  loadingProveedores = true;
  errorProveedores = '';
  proveedorForm: FormGroup;
  guardandoProveedor = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]]
    });
    this.proveedorForm = this.fb.group({
      rutEmpresa: ['', [Validators.required, Validators.maxLength(12)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      contactoEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  ngOnInit() {
    this.loadCategorias();
    this.loadProveedores();
  }

  isInvalidCategoria(controlName: string): boolean {
    const control = this.categoriaForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  isInvalidProveedor(controlName: string): boolean {
    const control = this.proveedorForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  loadCategorias() {
    this.loadingCategorias = true;
    this.apiService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = Array.isArray(data) ? data : [];
        this.loadingCategorias = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorCategorias = 'Error al cargar categorías.';
        this.loadingCategorias = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadProveedores() {
    this.loadingProveedores = true;
    this.apiService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = Array.isArray(data) ? data : [];
        this.loadingProveedores = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorProveedores = 'Error al cargar proveedores.';
        this.loadingProveedores = false;
        this.cdr.markForCheck();
      }
    });
  }

  crearCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    this.guardandoCategoria = true;
    this.apiService.crearCategoria(this.categoriaForm.value).subscribe({
      next: (categoria) => {
        this.toast.success(`Categoría "${categoria.nombre}" creada exitosamente.`);
        this.categoriaForm.reset();
        this.guardandoCategoria = false;
        this.loadCategorias();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg: string = err.error?.message || 'Error al crear la categoría.';
        this.toast.error(msg);
        this.guardandoCategoria = false;
        this.cdr.markForCheck();
      }
    });
  }

  crearProveedor() {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }
    this.guardandoProveedor = true;
    this.apiService.crearProveedor(this.proveedorForm.value).subscribe({
      next: (proveedor) => {
        this.toast.success(`Proveedor "${proveedor.razonSocial}" creado exitosamente.`);
        this.proveedorForm.reset();
        this.guardandoProveedor = false;
        this.loadProveedores();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg: string = err.error?.message || 'Error al crear el proveedor.';
        this.toast.error(msg);
        this.guardandoProveedor = false;
        this.cdr.markForCheck();
      }
    });
  }
}
