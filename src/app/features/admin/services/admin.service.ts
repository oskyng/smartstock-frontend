import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registrarComercio(comercio: any): Observable<any> {
    return this.http.post(`${this.API}/comercios`, comercio);
  }

  obtenerComercios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/comercios`);
  }

  obtenerComercio(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/comercios/${id}`);
  }

  actualizarComercio(id: number, comercio: any): Observable<any> {
    return this.http.put(`${this.API}/comercios/${id}`, comercio);
  }

  eliminarComercio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/comercios/${id}`);
  }
}
