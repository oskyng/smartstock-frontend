import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertsComponent } from './alerts.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { of, throwError } from 'rxjs';

describe('AlertsComponent', () => {
  let component: AlertsComponent;
  let fixture: ComponentFixture<AlertsComponent>;
  let apiService: any;
  let toastService: any;

  beforeEach(async () => {
    apiService = {
      getAlertas: vi.fn().mockReturnValue(of([])),
      atenderAlerta: vi.fn().mockReturnValue(of(undefined))
    };
    toastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on init', () => {
    const mockAlertas = [{ id: 1, mensaje: 'Test', estado: 'PENDIENTE', rolAsignado: 'ADMIN', fechaLimite: '', fechaCreacion: '' }];
    apiService.getAlertas.mockReturnValue(of(mockAlertas));

    component.ngOnInit();

    expect(component.alerts).toEqual(mockAlertas);
    expect(apiService.getAlertas).toHaveBeenCalled();
  });

  it('should set error on load failure', () => {
    apiService.getAlertas.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAlertas();
    expect(component.error).toBe('Error al cargar alertas.');
    expect(component.loading).toBe(false);
  });

  it('should call atenderAlerta and reload', () => {
    apiService.atenderAlerta.mockReturnValue(of(undefined));
    apiService.getAlertas.mockReturnValue(of([]));
    component.atender(1);
    expect(apiService.atenderAlerta).toHaveBeenCalledWith(1);
  });

  it('should toast on atender error', () => {
    apiService.atenderAlerta.mockReturnValue(throwError(() => new Error('fail')));
    component.atender(1);
    expect(toastService.error).toHaveBeenCalledWith('Error al atender la alerta.');
  });
});
