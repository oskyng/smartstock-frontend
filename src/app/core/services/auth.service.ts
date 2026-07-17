import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getRoleLabel } from '../utils/role-label.util';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  email: string;
  rol: string;
  idComercio?: number | null;
}

export interface StoredUser {
  email: string;
  rol: string;
  idComercio: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API = environment.apiUrl;
  private userKey = 'ss_user';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasSession());

  constructor(private http: HttpClient) {}

  /**
   * El JWT viaja en una cookie httpOnly que el propio backend setea en la respuesta (ver
   * BffController.login) — nunca llega en el body ni es legible desde JS (mitiga robo de
   * sesión vía XSS). `withCredentials` es necesario para que el navegador la reciba/adjunte.
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        const idComercio = res.idComercio ?? null;
        localStorage.setItem(this.userKey, JSON.stringify({ email: res.email, rol: res.rol, idComercio }));
        localStorage.setItem('rol', res.rol);
        if (idComercio !== null) {
          localStorage.setItem('ss_comercio_id', idComercio.toString());
          localStorage.setItem('idComercio', idComercio.toString());
        } else {
          localStorage.removeItem('ss_comercio_id');
          localStorage.removeItem('idComercio');
        }
        this.loggedIn$.next(true);
      })
    );
  }

  /**
   * Limpia el estado local y pide al backend que invalide la cookie httpOnly (JS no puede
   * borrarla directamente). Best-effort: si la llamada de red falla, igual se limpia el estado
   * local — la cookie expira sola al vencer su Max-Age.
   */
  logout(): void {
    this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true }).subscribe({ error: () => {} });
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('ss_comercio_id');
    localStorage.removeItem('rol');
    localStorage.removeItem('idComercio');
    this.loggedIn$.next(false);
  }

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return {
      email: parsed.email,
      rol: parsed.rol,
      idComercio: parsed.idComercio ?? null
    };
  }

  /** Nombre legible del rol para mostrar en la UI (ej. "Gerente de Tienda"). */
  getRoleLabel(): string {
    return getRoleLabel(this.getUser()?.rol);
  }

  /** Etiqueta del comercio activo: ID del comercio, o alcance global para ADMIN_SISTEMA. */
  getComercioLabel(): string {
    const idComercio = this.getUser()?.idComercio;
    return idComercio ? `Comercio #${idComercio}` : 'Acceso Global';
  }

  isLoggedIn(): boolean {
    return this.hasSession();
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  /**
   * El JWT es una cookie httpOnly invisible a JS, así que "sesión activa" ya no puede verificarse
   * mirando el token: se infiere de la presencia de los metadatos no sensibles (email/rol/idComercio)
   * guardados en el login. La fuente de verdad real sigue siendo el backend (401 si la cookie
   * expiró o no existe, manejado por errorInterceptor).
   */
  private hasSession(): boolean {
    return !!localStorage.getItem(this.userKey);
  }
}
