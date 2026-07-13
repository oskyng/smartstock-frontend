import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, ProductoResponse, LoteResponse, CategoriaResponse } from '../../core/services/api.service';
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
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  products: ProductoResponse[] = [];
  lotes: LoteResponse[] = [];
  categorias: CategoriaResponse[] = [];
  loading = true;
  loadingLotes = true;
  cargandoCategorias = true;
  error = '';
  errorLotes = '';

  productoForm: FormGroup;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  nuevaCategoriaForm: FormGroup;
  mostrarNuevaCategoria = false;
  guardandoCategoria = false;

  activeTab: 'productos' | 'lotes' = 'productos';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      codigoBarra: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      precioBase: [null, [Validators.required, Validators.min(0), Validators.max(100_000_000)]],
      idCategoria: [null, Validators.required]
    });
    this.nuevaCategoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    this.loadProductos();
    this.loadLotes();
    this.loadCategorias();
  }

  isInvalid(controlName: string): boolean {
    const control = this.productoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  loadProductos() {
    this.loading = true;
    this.apiService.getProductos().subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar productos.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadLotes() {
    this.loadingLotes = true;
    this.apiService.getLotes().subscribe({
      next: (data) => {
        this.lotes = Array.isArray(data) ? data : [];
        this.loadingLotes = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorLotes = 'Error al cargar lotes.';
        this.loadingLotes = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCategorias() {
    this.cargandoCategorias = true;
    this.apiService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = Array.isArray(data) ? data : [];
        this.cargandoCategorias = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoCategorias = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleNuevaCategoria() {
    this.mostrarNuevaCategoria = !this.mostrarNuevaCategoria;
    this.nuevaCategoriaForm.reset();
  }

  crearCategoria() {
    if (this.nuevaCategoriaForm.invalid) {
      this.nuevaCategoriaForm.markAllAsTouched();
      return;
    }
    this.guardandoCategoria = true;
    this.apiService.crearCategoria(this.nuevaCategoriaForm.value).subscribe({
      next: (categoria) => {
        this.categorias = [...this.categorias, categoria];
        this.productoForm.get('idCategoria')?.setValue(categoria.id);
        this.toast.success(`Categoría "${categoria.nombre}" creada exitosamente.`);
        this.mostrarNuevaCategoria = false;
        this.guardandoCategoria = false;
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

  crearProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.apiService.crearProducto(this.productoForm.value).subscribe({
      next: () => {
        this.mensajeExito = 'Producto creado exitosamente.';
        this.toast.success(this.mensajeExito);
        this.productoForm.reset();
        this.guardando = false;
        this.loadProductos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al crear el producto.';
        this.toast.error(this.mensajeError);
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
