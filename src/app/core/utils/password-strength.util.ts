export type PasswordStrength = 'debil' | 'media' | 'fuerte';

/**
 * Heurística de fortaleza puramente informativa (no bloquea el envío del formulario): el backend
 * solo exige longitud mínima (ver UsuarioRequestDTO/CambiarContrasenaRequestDTO), así que agregar
 * un validador duro aquí rechazaría contraseñas que el backend aceptaría sin problema. Esto es
 * solo una advertencia visual para desincentivar contraseñas débiles.
 */
export function passwordStrength(password: string | null | undefined): PasswordStrength {
  if (!password) {
    return 'debil';
  }

  let puntaje = 0;
  if (password.length >= 8) puntaje++;
  if (password.length >= 12) puntaje++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntaje++;
  if (/\d/.test(password)) puntaje++;
  if (/[^A-Za-z0-9]/.test(password)) puntaje++;

  if (puntaje >= 4) return 'fuerte';
  if (puntaje >= 2) return 'media';
  return 'debil';
}

export const PASSWORD_STRENGTH_LABEL: Record<PasswordStrength, string> = {
  debil: 'Débil',
  media: 'Media',
  fuerte: 'Fuerte'
};
