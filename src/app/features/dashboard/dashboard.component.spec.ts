import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: any;

  const mockDashboard = {
    productos: [{ id: 1, nombre: 'Test', codigoBarra: '123', nombreCategoria: 'Cat', precioBase: 100 }],
    lotesRecientes: [],
    alertasPendientes: [],
    reglasActivas: [],
    capitalEnRiesgo: 0
  };

  function enDias(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  beforeEach(async () => {
    apiService = {
      getDashboard: vi.fn().mockReturnValue(of(mockDashboard))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(apiService.getDashboard).toHaveBeenCalled();
    expect(component.productos.length).toBe(1);
    expect(component.totalProductos).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should set error on load failure', () => {
    apiService.getDashboard.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar el dashboard.');
    expect(component.loading).toBe(false);
  });

  it('should group lotes in risk (by reglas matching category + días críticos) by real category', () => {
    apiService.getDashboard.mockReturnValue(of({
      ...mockDashboard,
      lotesRecientes: [
        { id: 1, nombreProducto: 'A', nombreCategoria: 'Lácteos', cantidadActual: 10, precioDinamico: 5, estadoLote: 'DISPONIBLE', fechaVencimiento: enDias(2), fechaRecepcion: '' },
        { id: 2, nombreProducto: 'B', nombreCategoria: 'Lácteos', cantidadActual: 4, precioDinamico: 5, estadoLote: 'DISPONIBLE', fechaVencimiento: enDias(4), fechaRecepcion: '' },
        { id: 3, nombreProducto: 'C', nombreCategoria: 'Bebidas', cantidadActual: 20, precioDinamico: 5, estadoLote: 'DISPONIBLE', fechaVencimiento: enDias(1), fechaRecepcion: '' },
        { id: 4, nombreProducto: 'D', nombreCategoria: 'Aseo', cantidadActual: 100, precioDinamico: 5, estadoLote: 'DISPONIBLE', fechaVencimiento: enDias(30), fechaRecepcion: '' }
      ],
      reglasActivas: [
        { id: 1, nombre: '', nombreCategoria: 'Lácteos', diasCriticosMin: 5, porcentajeDescuento: 10, nombreGerente: '', activa: 1 },
        { id: 2, nombre: '', nombreCategoria: 'Bebidas', diasCriticosMin: 5, porcentajeDescuento: 10, nombreGerente: '', activa: 1 },
        { id: 3, nombre: '', nombreCategoria: 'Aseo', diasCriticosMin: 5, porcentajeDescuento: 10, nombreGerente: '', activa: 0 }
      ],
      capitalEnRiesgo: 12345
    }));

    component.ngOnInit();

    expect(component.riesgoPorCategoria).toEqual([
      { categoria: 'Bebidas', valor: 100, porcentaje: 100 },
      { categoria: 'Lácteos', valor: 70, porcentaje: 70 }
    ]);
    expect(component.totalLotesCriticos).toBe(3);
    expect(component.capitalEnRiesgo).toBe(12345);
  });
});
