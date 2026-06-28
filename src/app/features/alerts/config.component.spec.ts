import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigComponent } from './config.component';
import { ApiService } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let apiService: any;

  const mockDashboard = {
    productos: [],
    lotesRecientes: [],
    alertasPendientes: [],
    reglasActivas: [
      { id: 1, nombreCategoria: 'Cat', diasCriticosMin: 5, porcentajeDescuento: 30, nombreGerente: 'Admin', activa: 1 }
    ]
  };

  beforeEach(async () => {
    apiService = {
      getDashboard: vi.fn().mockReturnValue(of(mockDashboard))
    };

    await TestBed.configureTestingModule({
      imports: [ConfigComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rules from dashboard', () => {
    expect(apiService.getDashboard).toHaveBeenCalled();
    expect(component.rules.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should set error on load failure', () => {
    apiService.getDashboard.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar reglas de depreciación.');
    expect(component.loading).toBe(false);
  });
});
