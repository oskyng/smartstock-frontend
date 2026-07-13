import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario.service';
import { environment } from '../../../environments/environment';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsuarioService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listarRoles should GET the role catalog', () => {
    const mockRoles = [
      { id: 1, nombre: 'ADMIN_SISTEMA', descripcion: 'SuperUser' },
      { id: 2, nombre: 'GERENTE_TIENDA', descripcion: 'Dueño' }
    ];
    service.listarRoles().subscribe(res => {
      expect(res).toEqual(mockRoles);
    });
    const req = httpMock.expectOne(`${API}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('crearUsuario should POST the new user payload', () => {
    const payload = {
      rut: '11.111.111-1', nombre: 'Juana', apellido: 'Perez',
      email: 'juana@smartstock.cl', password: 'Password123', idRol: 4, idComercio: null
    };
    const mockRes = {
      mensaje: 'ok',
      usuario: { id: 1, rut: payload.rut, nombre: payload.nombre, apellido: payload.apellido, email: payload.email, rol: 'REPONEDOR_SALA', idComercio: null, activo: 1 },
      timestamp: 123
    };
    service.crearUsuario(payload).subscribe(res => {
      expect(res).toEqual(mockRes);
    });
    const req = httpMock.expectOne(`${API}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockRes);
  });

  it('listarUsuarios should GET the comercio user list', () => {
    const mockUsuarios = [
      { id: 5, rut: '11.111.111-1', nombre: 'Juana', apellido: 'Perez', email: 'juana@smartstock.cl', rol: 'OPERADOR_INVENTARIO', idComercio: 1, activo: 1 }
    ];
    service.listarUsuarios().subscribe(res => {
      expect(res).toEqual(mockUsuarios);
    });
    const req = httpMock.expectOne(`${API}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsuarios);
  });

  it('actualizarUsuario should PUT the update payload', () => {
    const payload = { nombre: 'Nuevo', apellido: 'Nombre', email: 'nuevo@smartstock.cl', idRol: 3 };
    const mockRes = { id: 5, rut: '11.111.111-1', nombre: 'Nuevo', apellido: 'Nombre', email: 'nuevo@smartstock.cl', rol: 'OPERADOR_INVENTARIO', idComercio: 1, activo: 1 };
    service.actualizarUsuario(5, payload).subscribe(res => {
      expect(res).toEqual(mockRes);
    });
    const req = httpMock.expectOne(`${API}/usuarios/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockRes);
  });

  it('eliminarUsuario should DELETE the user', () => {
    service.eliminarUsuario(5).subscribe();
    const req = httpMock.expectOne(`${API}/usuarios/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
