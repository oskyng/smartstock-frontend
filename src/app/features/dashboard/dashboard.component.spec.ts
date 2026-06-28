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
    reglasActivas: []
  };

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
});
