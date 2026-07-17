import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Elimina puntos, guion y espacios, dejando solo dígitos y el dígito verificador en mayúscula. */
export function limpiarRut(rut: string): string {
  return (rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Calcula el dígito verificador de un RUT chileno mediante el algoritmo módulo 11. */
export function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/** Formatea un RUT (con o sin puntos/guion) al formato estándar XX.XXX.XXX-X. */
export function formatearRut(valor: string): string {
  const limpio = limpiarRut(valor).slice(0, 9);
  if (!limpio) return '';
  const cuerpo = limpio.length > 1 ? limpio.slice(0, -1) : limpio;
  const dv = limpio.length > 1 ? limpio.slice(-1) : '';
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dv ? `${cuerpoConPuntos}-${dv}` : cuerpoConPuntos;
}

/** Valida formato y dígito verificador de un RUT chileno. */
export function esRutValido(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d{1,8}$/.test(cuerpo)) return false;
  return calcularDigitoVerificador(cuerpo) === dv;
}

/** Validador reactivo de RUT chileno: no marca error en campo vacío (usar junto a Validators.required). */
export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return esRutValido(control.value) ? null : { rutInvalido: true };
  };
}
