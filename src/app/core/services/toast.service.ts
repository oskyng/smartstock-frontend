import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servicio centralizado de notificaciones visuales (Toast/Alert).
 * Reemplaza el uso disperso de alert()/confirm() y mensajes inline silenciosos.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.show(message, ['toast-success'], duration);
  }

  error(message: string, duration = 6000): void {
    this.show(message, ['toast-error'], duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, ['toast-warning'], duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, ['toast-info'], duration);
  }

  private show(message: string, panelClass: string[], duration: number): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
