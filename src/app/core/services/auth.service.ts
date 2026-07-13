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
  token: string;
  email: string;
  rol: string;
  idComercio?: number;
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
  private tokenKey = 'ss_token';
  private userKey = 'ss_user';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, credentials).pipe(
      tap(res => {
        const idComercio = res.idComercio ?? null;
        localStorage.setItem(this.tokenKey, res.token);
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

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('ss_comercio_id');
    localStorage.removeItem('rol');
    localStorage.removeItem('idComercio');
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
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
    return this.hasToken();
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
