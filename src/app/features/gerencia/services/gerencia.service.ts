import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type EstadoAlertaAuditoria = 'PENDIENTE' | 'ATENDIDA_A_TIEMPO' | 'ATENDIDA_CON_RETRASO' | 'ESCALADA_AL_GERENTE';

export interface AlertaAuditoria {
  id: number;
  loteId: number;
  productoNombre: string;
  codigoBarra: string;
  usuarioAsignadoId: number | null;
  usuarioAsignadoNombre: string;
  estadoAlerta: EstadoAlertaAuditoria;
  fechaLimiteAtencion: string;
  fechaAtencion: string | null;
  descripcionAlerta: string;
}

@Injectable({
  providedIn: 'root'
})
export class GerenciaService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerReglas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/reglas-depreciacion`);
  }

  crearRegla(regla: any): Observable<any> {
    return this.http.post(`${this.API}/reglas-depreciacion`, regla);
  }

  eliminarRegla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/reglas-depreciacion/${id}`);
  }

  obtenerAlertas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/alertas`);
  }

  /** Auditoría completa de alertas del comercio (todos los estados), exclusiva de GERENTE_TIENDA. */
  obtenerAuditoriaAlertas(): Observable<AlertaAuditoria[]> {
    return this.http.get<AlertaAuditoria[]>(`${this.API}/alertas/auditoria`);
  }
}
