import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
}
