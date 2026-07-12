import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { decodeJwt, getRoleFromPayload, stripRolePrefix } from '../utils/jwt.util';

/**
 * Directiva estructural para mostrar/ocultar elementos según el rol del usuario logueado.
 *
 * Uso:
 *   <a *hasRole="'ROLE_ADMIN_SISTEMA'">...</a>
 *   <button *hasRole="['ROLE_GERENTE_TIENDA', 'ROLE_ADMIN_SISTEMA']">...</button>
 *
 * Acepta roles con o sin el prefijo 'ROLE_' (se normaliza internamente),
 * ya que el claim 'rol' del JWT no trae el prefijo pero Spring Security sí lo usa.
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  private allowedRoles: string[] = [];
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set hasRole(roles: string | string[] | null | undefined) {
    const list = roles ? (Array.isArray(roles) ? roles : [roles]) : [];
    this.allowedRoles = list.map(stripRolePrefix);
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const allowed = this.userHasAnyAllowedRole();

    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private userHasAnyAllowedRole(): boolean {
    if (this.allowedRoles.length === 0) {
      return true;
    }

    const token = localStorage.getItem('ss_token');
    if (!token) {
      return false;
    }

    const rol = getRoleFromPayload(decodeJwt(token));
    return this.allowedRoles.includes(rol);
  }
}
