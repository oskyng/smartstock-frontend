import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RolResponse {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioRequest {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  idRol: number;
  idComercio?: number | null;
}

export interface UsuarioResponse {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  idComercio: number | null;
  activo: number;
}

export interface UsuarioCreateResponse {
  mensaje: string;
  usuario: UsuarioResponse;
  timestamp: number;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  apellido: string;
  email: string;
  idRol: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Catálogo completo de roles del sistema (el filtrado por jerarquía se hace en el componente). */
  listarRoles(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(`${this.API}/roles`);
  }

  crearUsuario(usuario: UsuarioRequest): Observable<UsuarioCreateResponse> {
    return this.http.post<UsuarioCreateResponse>(`${this.API}/usuarios`, usuario);
  }

  /** Lista de usuarios del comercio del solicitante (o todos, si es ADMIN_SISTEMA sin comercio). */
  listarUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.API}/usuarios`);
  }

  actualizarUsuario(id: number, usuario: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.API}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/usuarios/${id}`);
  }
}
