import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigComponent } from './config.component';
import { ApiService } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let apiService: any;

  const mockRules = [
    { id: 1, nombreCategoria: 'Cat', diasCriticosMin: 5, porcentajeDescuento: 30, nombreGerente: 'Admin', activa: 1 }
  ];

  beforeEach(async () => {
    apiService = {
      getReglas: vi.fn().mockReturnValue(of(mockRules)),
      crearRegla: vi.fn().mockReturnValue(of({})),
      eliminarRegla: vi.fn().mockReturnValue(of(undefined))
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

  it('should load rules on init', () => {
    expect(apiService.getReglas).toHaveBeenCalled();
    expect(component.rules).toEqual(mockRules);
    expect(component.loading).toBe(false);
  });

  it('should set error on load failure', () => {
    apiService.getReglas.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar reglas de depreciación.');
    expect(component.loading).toBe(false);
  });
});
