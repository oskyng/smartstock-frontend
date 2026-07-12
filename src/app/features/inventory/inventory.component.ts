import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, ProductoResponse, LoteResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  products: ProductoResponse[] = [];
  lotes: LoteResponse[] = [];
  loading = true;
  loadingLotes = true;
  error = '';
  errorLotes = '';

  productoForm: FormGroup;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  activeTab: 'productos' | 'lotes' = 'productos';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      precioBase: [null, [Validators.required, Validators.min(0), Validators.max(100_000_000)]],
      categoria: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    this.loadProductos();
    this.loadLotes();
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
