import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatearRut } from '../../core/utils/rut.util';

/**
 * Aplica el formato estándar chileno (XX.XXX.XXX-X) mientras el usuario escribe.
 * Uso: <input formControlName="rut" appRutFormat>
 */
@Directive({
  selector: '[appRutFormat]',
  standalone: true
})
export class RutFormatDirective {
  constructor(private el: ElementRef<HTMLInputElement>, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const formateado = formatearRut(valor);
    this.el.nativeElement.value = formateado;
    this.ngControl.control?.setValue(formateado);
  }
}
