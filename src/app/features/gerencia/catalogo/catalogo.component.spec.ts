import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoComponent } from './catalogo.component';
import { ApiService } from '../../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;
  let apiService: any;

  const mockCategorias = [{ id: 1, nombre: 'BEBIDAS' }];
  const mockProveedores = [{ id: 1, rutEmpresa: '76.111.111-1', razonSocial: 'Proveedor Uno', contactoEmail: 'contacto@proveedor.cl' }];

  beforeEach(async () => {
    apiService = {
      getCategorias: vi.fn().mockReturnValue(of(mockCategorias)),
      crearCategoria: vi.fn().mockReturnValue(of({ id: 2, nombre: 'LACTEOS' })),
      getProveedores: vi.fn().mockReturnValue(of(mockProveedores)),
      crearProveedor: vi.fn().mockReturnValue(of({ id: 2, rutEmpresa: '76.222.222-2', razonSocial: 'Proveedor Dos', contactoEmail: 'dos@proveedor.cl' }))
    };

    await TestBed.configureTestingModule({
      imports: [CatalogoComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categorias and proveedores on init', () => {
    expect(apiService.getCategorias).toHaveBeenCalled();
    expect(apiService.getProveedores).toHaveBeenCalled();
    expect(component.categorias).toEqual(mockCategorias);
    expect(component.proveedores).toEqual(mockProveedores);
    expect(component.loadingCategorias).toBe(false);
    expect(component.loadingProveedores).toBe(false);
  });

  it('should set errorCategorias on categorias load failure', () => {
    apiService.getCategorias.mockReturnValue(throwError(() => new Error('fail')));
    component.loadCategorias();
    expect(component.errorCategorias).toBe('Error al cargar categorías.');
    expect(component.loadingCategorias).toBe(false);
  });

  it('should set errorProveedores on proveedores load failure', () => {
    apiService.getProveedores.mockReturnValue(throwError(() => new Error('fail')));
    component.loadProveedores();
    expect(component.errorProveedores).toBe('Error al cargar proveedores.');
    expect(component.loadingProveedores).toBe(false);
  });

  it('crearCategoria should not call the service when the form is invalid', () => {
    component.crearCategoria();
    expect(apiService.crearCategoria).not.toHaveBeenCalled();
  });

  it('crearCategoria should submit and reload the list on success', () => {
    component.categoriaForm.setValue({ nombre: 'LACTEOS' });
    component.crearCategoria();
    expect(apiService.crearCategoria).toHaveBeenCalledWith({ nombre: 'LACTEOS' });
    expect(apiService.getCategorias).toHaveBeenCalledTimes(2);
  });

  it('crearProveedor should not call the service when the form is invalid', () => {
    component.crearProveedor();
    expect(apiService.crearProveedor).not.toHaveBeenCalled();
  });

  it('crearProveedor should submit and reload the list on success', () => {
    component.proveedorForm.setValue({ rutEmpresa: '76.222.222-2', razonSocial: 'Proveedor Dos', contactoEmail: 'dos@proveedor.cl' });
    component.crearProveedor();
    expect(apiService.crearProveedor).toHaveBeenCalledWith({ rutEmpresa: '76.222.222-2', razonSocial: 'Proveedor Dos', contactoEmail: 'dos@proveedor.cl' });
    expect(apiService.getProveedores).toHaveBeenCalledTimes(2);
  });
});
