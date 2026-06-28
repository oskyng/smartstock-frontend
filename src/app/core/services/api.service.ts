import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductoResponse {
  id: number;
  codigoBarra: string;
  nombre: string;
  nombreCategoria: string;
  precioBase: number;
}

export interface LoteResponse {
  id: number;
  nombreProducto: string;
  cantidadActual: number;
  precioDinamico: number;
  fechaVencimiento: string;
  estadoLote: string;
  fechaRecepcion: string;
}

export interface AlertaResponse {
  id: number;
  mensaje: string;
  rolAsignado: string;
  fechaLimite: string;
  estado: string;
  fechaCreacion: string;
}

export interface ReglaDepreciacionResponse {
  id: number;
  nombreCategoria: string;
  diasCriticosMin: number;
  porcentajeDescuento: number;
  nombreGerente: string;
  activa: number;
}

export interface DashboardResponse {
  productos: ProductoResponse[];
  lotesRecientes: LoteResponse[];
  alertasPendientes: AlertaResponse[];
  reglasActivas: ReglaDepreciacionResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.API}/dashboard`);
  }

  getProductos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API}/productos`);
  }

  getAlertas(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.API}/alertas`);
  }

  atenderAlerta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/alertas/${id}/atender`, {});
  }
}
