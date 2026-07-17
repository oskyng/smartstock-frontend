import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresoMercanciaComponent } from './ingreso-mercancia.component';
import { InventoryService } from '../services/inventory.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';

describe('IngresoMercanciaComponent', () => {
  let component: IngresoMercanciaComponent;
  let fixture: ComponentFixture<IngresoMercanciaComponent>;
  let inventoryService: any;
  let apiService: any;
  let toastService: any;

  const mockProductos = [
    { id: 1, codigoBarra: '111', nombre: 'Yogurt', nombreCategoria: 'Lácteos', precioBase: 500 }
  ];
  const mockProveedores = [
    { id: 2, rutEmpresa: '76.111.111-1', razonSocial: 'Proveedor Uno', contactoEmail: 'contacto@proveedor.cl' }
  ];

  beforeEach(async () => {
    inventoryService = {
      crearLote: vi.fn().mockReturnValue(of({ id: 1 }))
    };
    apiService = {
      getProductos: vi.fn().mockReturnValue(of(mockProductos)),
      getProveedores: vi.fn().mockReturnValue(of(mockProveedores))
    };
    toastService = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [IngresoMercanciaComponent],
      providers: [
        { provide: InventoryService, useValue: inventoryService },
        { provide: ApiService, useValue: apiService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoMercanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load productos and proveedores on init', () => {
    expect(apiService.getProductos).toHaveBeenCalled();
    expect(apiService.getProveedores).toHaveBeenCalled();
    expect(component.productos).toEqual(mockProductos);
    expect(component.proveedores).toEqual(mockProveedores);
    expect(component.cargandoOpciones).toBe(false);
    expect(component.errorOpciones).toBeNull();
  });

  it('should set errorOpciones when productos fail to load', () => {
    apiService.getProductos.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarOpciones();
    expect(component.errorOpciones).toBe('No se pudieron cargar los productos.');
    expect(component.cargandoOpciones).toBe(false);
  });

  it('should set errorOpciones when proveedores fail to load', () => {
    apiService.getProveedores.mockReturnValue(throwError(() => new Error('fail')));
    component.cargarOpciones();
    expect(component.errorOpciones).toBe('No se pudieron cargar los proveedores.');
    expect(component.cargandoOpciones).toBe(false);
  });

  it('should submit a valid form with selected producto and proveedor ids', () => {
    const valorEsperado = {
      idProducto: 1,
      idProveedor: 2,
      cantidadInicial: 100,
      costoUnitario: 10,
      precioDinamico: 15,
      fechaVencimiento: '2030-01-01'
    };
    component.form.setValue(valorEsperado);

    component.onSubmit();

    // onSubmit resetea el form en éxito, así que se compara contra el valor capturado
    // antes de enviar (no contra component.form.value, que ya habría vuelto a null).
    expect(inventoryService.crearLote).toHaveBeenCalledWith(valorEsperado);
    expect(toastService.success).toHaveBeenCalled();
  });

  it('should not submit when idProducto or idProveedor is missing', () => {
    component.form.patchValue({ idProducto: null, idProveedor: null });

    component.onSubmit();

    expect(inventoryService.crearLote).not.toHaveBeenCalled();
    expect(component.form.get('idProducto')?.touched).toBe(true);
  });
});
