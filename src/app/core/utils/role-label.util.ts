const ROLE_LABELS: Record<string, string> = {
  ADMIN_SISTEMA: 'Administrador del Sistema',
  GERENTE_TIENDA: 'Gerente de Tienda',
  OPERADOR_INVENTARIO: 'Operador de Inventario',
  REPONEDOR_SALA: 'Reponedor de Sala'
};

/** Nombre legible para un rol técnico (ej. "GERENTE_TIENDA" -> "Gerente de Tienda"). */
export function getRoleLabel(rol: string | null | undefined): string {
  if (!rol) {
    return '';
  }
  return ROLE_LABELS[rol] ?? rol;
}
