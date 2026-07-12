import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoteRequest {
  idProducto: number;
  idProveedor: number;
  cantidadInicial: number;
  costoUnitario: number;
  precioDinamico: number;
  fechaVencimiento: string; // yyyy-MM-dd
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

export interface ProductoResponse {
  id: number;
  codigoBarra: string;
  nombre: string;
  nombreCategoria: string;
  precioBase: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crearLote(lote: LoteRequest): Observable<LoteResponse> {
    return this.http.post<LoteResponse>(`${this.API}/inventario/lotes`, lote);
  }

  obtenerLotes(): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.API}/inventario/lotes`);
  }

  obtenerProductos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API}/productos`);
  }

  obtenerProducto(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.API}/productos/${id}`);
  }

  crearProducto(producto: Partial<ProductoResponse>): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(`${this.API}/productos`, producto);
  }
}
