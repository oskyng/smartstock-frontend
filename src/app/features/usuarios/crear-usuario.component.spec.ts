import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CrearUsuarioComponent } from './crear-usuario.component';
import { UsuarioService } from '../../core/services/usuario.service';
import { AdminService } from '../admin/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

describe('CrearUsuarioComponent', () => {
  let component: CrearUsuarioComponent;
  let fixture: ComponentFixture<CrearUsuarioComponent>;
  let usuarioService: any;
  let adminService: any;
  let authService: any;
  let toastService: any;

  const mockRoles = [
    { id: 1, nombre: 'ADMIN_SISTEMA' },
    { id: 2, nombre: 'GERENTE_TIENDA' },
    { id: 3, nombre: 'OPERADOR_INVENTARIO' },
    { id: 4, nombre: 'REPONEDOR_SALA' }
  ];

  const mockUsuarios = [
    { id: 5, rut: '11.111.111-1', nombre: 'Juana', apellido: 'Perez', email: 'juana@smartstock.cl', rol: 'OPERADOR_INVENTARIO', idComercio: 1, activo: 1 },
    { id: 6, rut: '22.222.222-2', nombre: 'Gerente', apellido: 'Otro', email: 'gerente2@smartstock.cl', rol: 'GERENTE_TIENDA', idComercio: 1, activo: 1 }
  ];

  function configure(rol: string) {
    usuarioService = {
      listarRoles: vi.fn().mockReturnValue(of(mockRoles)),
      crearUsuario: vi.fn().mockReturnValue(of({ mensaje: 'ok', usuario: { email: 'x@x.com', rol: 'REPONEDOR_SALA' } })),
      listarUsuarios: vi.fn().mockReturnValue(of(mockUsuarios)),
      actualizarUsuario: vi.fn().mockReturnValue(of(mockUsuarios[0])),
      eliminarUsuario: vi.fn().mockReturnValue(of(undefined))
    };
    adminService = {
      obtenerComercios: vi.fn().mockReturnValue(of([{ id: 1, razonSocial: 'Comercio Uno' }]))
    };
    authService = {
      getUser: vi.fn().mockReturnValue({ email: 'req@smartstock.cl', rol, idComercio: rol === 'ADMIN_SISTEMA' ? null : 1 })
    };
    toastService = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [CrearUsuarioComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AdminService, useValue: adminService },
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    fixture = TestBed.createComponent(CrearUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    configure('ADMIN_SISTEMA');
    expect(component).toBeTruthy();
  });

  it('ADMIN_SISTEMA should see all 4 roles and load comercios', () => {
    configure('ADMIN_SISTEMA');
    expect(component.esAdmin).toBe(true);
    expect(component.roles.map(r => r.nombre)).toEqual(['ADMIN_SISTEMA', 'GERENTE_TIENDA', 'OPERADOR_INVENTARIO', 'REPONEDOR_SALA']);
    expect(adminService.obtenerComercios).toHaveBeenCalled();
    expect(component.comercios.length).toBe(1);
  });

  it('GERENTE_TIENDA should only see OPERADOR_INVENTARIO and REPONEDOR_SALA, and skip comercios', () => {
    configure('GERENTE_TIENDA');
    expect(component.esAdmin).toBe(false);
    expect(component.roles.map(r => r.nombre)).toEqual(['OPERADOR_INVENTARIO', 'REPONEDOR_SALA']);
    expect(adminService.obtenerComercios).not.toHaveBeenCalled();
  });

  it('should show a toast error when the role catalog fails to load', () => {
    configure('ADMIN_SISTEMA');
    usuarioService.listarRoles.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarRoles();
    expect(component.mensajeError).toBe('No se pudo cargar el catálogo de roles.');
    expect(toastService.error).toHaveBeenCalled();
  });

  it('onSubmit should not call the service when the form is invalid', () => {
    configure('GERENTE_TIENDA');
    component.onSubmit();
    expect(usuarioService.crearUsuario).not.toHaveBeenCalled();
  });

  it('onSubmit should force idComercio to null for a non-admin requester', () => {
    configure('GERENTE_TIENDA');
    component.form.setValue({
      rut: '11.111.111-1', nombre: 'Juana', apellido: 'Perez',
      email: 'juana@smartstock.cl', password: 'Password123', idRol: 4, idComercio: 999
    });
    component.onSubmit();
    expect(usuarioService.crearUsuario).toHaveBeenCalledWith(expect.objectContaining({ idComercio: null }));
    expect(toastService.success).toHaveBeenCalled();
  });

  it('onSubmit should show a toast error on failure', () => {
    configure('ADMIN_SISTEMA');
    usuarioService.crearUsuario.mockReturnValue(throwError(() => ({ error: { message: 'RUT ya existe' } })));
    component.form.setValue({
      rut: '11.111.111-1', nombre: 'Juana', apellido: 'Perez',
      email: 'juana@smartstock.cl', password: 'Password123', idRol: 1, idComercio: null
    });
    component.onSubmit();
    expect(component.mensajeError).toBe('RUT ya existe');
    expect(toastService.error).toHaveBeenCalledWith('RUT ya existe');
  });

  it('should load usuarios on init', () => {
    configure('ADMIN_SISTEMA');
    expect(usuarioService.listarUsuarios).toHaveBeenCalled();
    expect(component.usuarios).toEqual(mockUsuarios);
    expect(component.cargandoUsuarios).toBe(false);
  });

  it('ADMIN_SISTEMA puedeGestionar should be true for any role', () => {
    configure('ADMIN_SISTEMA');
    expect(component.puedeGestionar(mockUsuarios[1])).toBe(true);
  });

  it('GERENTE_TIENDA puedeGestionar should be false for a GERENTE_TIENDA/ADMIN_SISTEMA row', () => {
    configure('GERENTE_TIENDA');
    expect(component.puedeGestionar(mockUsuarios[0])).toBe(true);
    expect(component.puedeGestionar(mockUsuarios[1])).toBe(false);
  });

  it('iniciarEdicion should populate the edit form from the selected user', () => {
    configure('ADMIN_SISTEMA');
    component.iniciarEdicion(mockUsuarios[0]);
    expect(component.editandoId).toBe(5);
    expect(component.editForm.value).toEqual({ nombre: 'Juana', apellido: 'Perez', email: 'juana@smartstock.cl', idRol: 3 });
  });

  it('cancelarEdicion should clear the editing state', () => {
    configure('ADMIN_SISTEMA');
    component.iniciarEdicion(mockUsuarios[0]);
    component.cancelarEdicion();
    expect(component.editandoId).toBeNull();
  });

  it('guardarEdicion should submit the edit form and reload the list', () => {
    configure('ADMIN_SISTEMA');
    component.iniciarEdicion(mockUsuarios[0]);
    component.guardarEdicion(5);
    expect(usuarioService.actualizarUsuario).toHaveBeenCalledWith(5, component.editForm.value);
    expect(toastService.success).toHaveBeenCalled();
    expect(component.editandoId).toBeNull();
  });

  it('eliminarUsuario should confirm before deactivating', () => {
    configure('ADMIN_SISTEMA');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.eliminarUsuario(mockUsuarios[0]);
    expect(usuarioService.eliminarUsuario).toHaveBeenCalledWith(5);
    expect(toastService.success).toHaveBeenCalled();
  });

  it('eliminarUsuario should do nothing if not confirmed', () => {
    configure('ADMIN_SISTEMA');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.eliminarUsuario(mockUsuarios[0]);
    expect(usuarioService.eliminarUsuario).not.toHaveBeenCalled();
  });
});
