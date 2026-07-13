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

export interface ProductoRequest {
  codigoBarra: string;
  nombre: string;
  idCategoria: number;
  precioBase: number;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
}

export interface CategoriaRequest {
  nombre: string;
}

export interface ProveedorResponse {
  id: number;
  rutEmpresa: string;
  razonSocial: string;
  contactoEmail: string;
}

export interface ProveedorRequest {
  rutEmpresa: string;
  razonSocial: string;
  contactoEmail: string;
}

export interface LoteResponse {
  id: number;
  nombreProducto: string;
  cantidadActual: number;
  precioDinamico: number;
  fechaVencimiento: string;
  estadoLote: string;
  fechaRecepcion: string;
  idProducto?: number;
  idProveedor?: number;
  cantidad?: number;
  precioCompra?: number;
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
  nombre: string;
  nombreCategoria: string;
  diasCriticosMin: number;
  porcentajeDescuento: number;
  nombreGerente: string;
  activa: boolean | number;
}

export interface ComercioResponse {
  id: number;
  rutEmpresa: string;
  razonSocial: string;
  rubro: string;
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

  // Dashboard consolidado
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.API}/dashboard`);
  }

  // Productos
  getProductos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API}/productos`);
  }

  getProducto(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.API}/productos/${id}`);
  }

  crearProducto(producto: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(`${this.API}/productos`, producto);
  }

  // Categorías
  getCategorias(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.API}/categorias`);
  }

  crearCategoria(categoria: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(`${this.API}/categorias`, categoria);
  }

  // Proveedores
  getProveedores(): Observable<ProveedorResponse[]> {
    return this.http.get<ProveedorResponse[]>(`${this.API}/proveedores`);
  }

  crearProveedor(proveedor: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(`${this.API}/proveedores`, proveedor);
  }

  // Lotes (Inventario)
  getLotes(): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.API}/inventario/lotes`);
  }

  crearLote(lote: any): Observable<LoteResponse> {
    return this.http.post<LoteResponse>(`${this.API}/inventario/lotes`, lote);
  }

  // Alertas
  getAlertas(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.API}/alertas`);
  }

  atenderAlerta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/alertas/${id}/atender`, {});
  }

  // Reglas de Depreciación
  getReglas(): Observable<ReglaDepreciacionResponse[]> {
    return this.http.get<ReglaDepreciacionResponse[]>(`${this.API}/reglas-depreciacion`);
  }

  crearRegla(regla: any): Observable<ReglaDepreciacionResponse> {
    return this.http.post<ReglaDepreciacionResponse>(`${this.API}/reglas-depreciacion`, regla);
  }

  eliminarRegla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/reglas-depreciacion/${id}`);
  }

  // Comercios
  getComercios(): Observable<ComercioResponse[]> {
    return this.http.get<ComercioResponse[]>(`${this.API}/comercios`);
  }

  getComercio(id: number): Observable<ComercioResponse> {
    return this.http.get<ComercioResponse>(`${this.API}/comercios/${id}`);
  }

  crearComercio(comercio: any): Observable<ComercioResponse> {
    return this.http.post<ComercioResponse>(`${this.API}/comercios`, comercio);
  }

  actualizarComercio(id: number, comercio: any): Observable<ComercioResponse> {
    return this.http.put<ComercioResponse>(`${this.API}/comercios/${id}`, comercio);
  }

  eliminarComercio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/comercios/${id}`);
  }
}
