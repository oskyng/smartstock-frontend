import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AlertaResponse {
  id: number;
  mensaje: string;
  rolAsignado: string;
  fechaLimite: string;
  estado: string;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerAlertas(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.API}/alertas`);
  }

  /** CA-07: el BFF expone la resolución de alarmas como PATCH, no PUT. */
  atenderAlerta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/alertas/${id}/atender`, {});
  }
}
