import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryComponent } from './inventory.component';
import { ApiService } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let apiService: any;

  beforeEach(async () => {
    apiService = {
      getProductos: vi.fn().mockReturnValue(of([])),
      getLotes: vi.fn().mockReturnValue(of([])),
      getCategorias: vi.fn().mockReturnValue(of([])),
      crearProducto: vi.fn().mockReturnValue(of({})),
      crearCategoria: vi.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const mockProducts = [{ id: 1, nombre: 'Producto 1', codigoBarra: '123', nombreCategoria: 'Cat', precioBase: 50 }];
    apiService.getProductos.mockReturnValue(of(mockProducts));

    component.ngOnInit();

    expect(component.products).toEqual(mockProducts);
    expect(apiService.getProductos).toHaveBeenCalled();
  });

  it('should set error on load failure', () => {
    apiService.getProductos.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar productos.');
    expect(component.loading).toBe(false);
  });

  it('should load lotes on init', () => {
    const mockLotes = [{ id: 1, nombreProducto: 'Producto 1', cantidadActual: 10, precioDinamico: 900, fechaVencimiento: '2027-01-01', estadoLote: 'DISPONIBLE', fechaRecepcion: '2026-01-01' }];
    apiService.getLotes.mockReturnValue(of(mockLotes));

    component.ngOnInit();

    expect(component.lotes).toEqual(mockLotes);
    expect(apiService.getLotes).toHaveBeenCalled();
    expect(component.loadingLotes).toBe(false);
  });

  it('should set errorLotes on lotes load failure', () => {
    apiService.getLotes.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.errorLotes).toBe('Error al cargar lotes.');
    expect(component.loadingLotes).toBe(false);
  });

  it('should load categorias on init', () => {
    const mockCategorias = [{ id: 1, nombre: 'GENERAL' }];
    apiService.getCategorias.mockReturnValue(of(mockCategorias));

    component.ngOnInit();

    expect(component.categorias).toEqual(mockCategorias);
    expect(component.cargandoCategorias).toBe(false);
  });

  it('crearProducto should send codigoBarra/idCategoria matching the backend DTO', () => {
    component.productoForm.setValue({
      codigoBarra: '7801234567890', nombre: 'Leche', precioBase: 1000, idCategoria: 1
    });
    component.crearProducto();
    expect(apiService.crearProducto).toHaveBeenCalledWith({
      codigoBarra: '7801234567890', nombre: 'Leche', precioBase: 1000, idCategoria: 1
    });
  });

  it('crearCategoria should add the new category and select it in the producto form', () => {
    const nuevaCategoria = { id: 5, nombre: 'TECNOLOGIA' };
    apiService.crearCategoria.mockReturnValue(of(nuevaCategoria));
    component.nuevaCategoriaForm.setValue({ nombre: 'TECNOLOGIA' });

    component.crearCategoria();

    expect(component.categorias).toContainEqual(nuevaCategoria);
    expect(component.productoForm.get('idCategoria')?.value).toBe(5);
    expect(component.mostrarNuevaCategoria).toBe(false);
  });
});
