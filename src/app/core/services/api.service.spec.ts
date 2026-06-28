import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDashboard should GET /dashboard', () => {
    const mock = { productos: [], lotesRecientes: [], alertasPendientes: [], reglasActivas: [] };
    service.getDashboard().subscribe(data => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${API}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getProductos should GET /productos', () => {
    const mock = [{ id: 1, codigoBarra: '123', nombre: 'Test', nombreCategoria: 'Cat', precioBase: 100 }];
    service.getProductos().subscribe(data => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${API}/productos`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getAlertas should GET /alertas', () => {
    const mock = [{ id: 1, mensaje: 'Alerta', rolAsignado: 'ADMIN', fechaLimite: '', estado: 'PENDIENTE', fechaCreacion: '' }];
    service.getAlertas().subscribe(data => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${API}/alertas`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('atenderAlerta should PATCH /alertas/:id/atender', () => {
    service.atenderAlerta(5).subscribe();
    const req = httpMock.expectOne(`${API}/alertas/5/atender`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});
