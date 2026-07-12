import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../services/inventory.service';
import { ToastService } from '../../../core/services/toast.service';

/** Límites de negocio razonables para evitar valores absurdos que rompan la UI o el backend. */
const MAX_CANTIDAD = 1_000_000;
const MAX_MONTO = 100_000_000;

const MENSAJE_FECHA_INVALIDA = 'Control de mermas: El lote debe vencer en una fecha futura';

/**
 * Espeja la regla de negocio del backend (LoteServiceImpl.guardarLote, CA-03):
 * se rechaza cualquier fecha de vencimiento igual o anterior a hoy.
 */
function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const fechaSeleccionada = new Date(control.value + 'T00:00:00');

  if (fechaSeleccionada < manana) {
    return { fechaPasada: true };
  }
  return null;
}

@Component({
  selector: 'app-ingreso-mercancia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './ingreso-mercancia.component.html'
})
export class IngresoMercanciaComponent {
  readonly mensajeFechaInvalida = MENSAJE_FECHA_INVALIDA;
  readonly maxCantidad = MAX_CANTIDAD;
  readonly maxMonto = MAX_MONTO;

  form: FormGroup;
  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      idProducto: [null, [Validators.required, Validators.min(1)]],
      idProveedor: [null, [Validators.required, Validators.min(1)]],
      cantidadInicial: [null, [Validators.required, Validators.min(1), Validators.max(MAX_CANTIDAD)]],
      costoUnitario: [null, [Validators.required, Validators.min(0.01), Validators.max(MAX_MONTO)]],
      precioDinamico: [null, [Validators.required, Validators.min(0.01), Validators.max(MAX_MONTO)]],
      fechaVencimiento: ['', [Validators.required, fechaFuturaValidator]]
    });
  }

  /** Fecha mínima seleccionable en el date-picker nativo (mañana), refuerza fechaFuturaValidator. */
  get fechaMinima(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().slice(0, 10);
  }

  /** true si el campo fue tocado/modificado y quedó inválido (borde rojo + mensaje). */
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get('fechaVencimiento')?.hasError('fechaPasada')) {
        this.toast.error(MENSAJE_FECHA_INVALIDA);
      }
      return;
    }

    this.enviando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    this.inventoryService.crearLote(this.form.value).subscribe({
      next: () => {
        this.mensajeExito = 'Lote registrado exitosamente.';
        this.toast.success(this.mensajeExito);
        this.form.reset();
        this.enviando = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        // El backend puede rechazar por regla de negocio (400) aunque el form
        // frontend haya pasado validación (ej. reglas adicionales del servidor).
        const backendMessage: string = err.error?.message || err.error?.error || 'Error al registrar el lote.';
        this.mensajeError = backendMessage;
        this.toast.error(backendMessage);
        this.enviando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
