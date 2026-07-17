import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardControlComponent } from './dashboard-control.component';
import { GerenciaService, AlertaAuditoria } from '../services/gerencia.service';
import { ApiService } from '../../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('DashboardControlComponent', () => {
  let component: DashboardControlComponent;
  let fixture: ComponentFixture<DashboardControlComponent>;
  let gerenciaService: any;
  let apiService: any;

  const alertaBase: Omit<AlertaAuditoria, 'estadoAlerta'> = {
    id: 1,
    loteId: 1,
    productoNombre: 'Yogurt',
    codigoBarra: '123',
    usuarioAsignadoId: 4,
    usuarioAsignadoNombre: 'Diego Silva',
    fechaLimiteAtencion: '2026-07-13T23:00:00',
    fechaAtencion: null,
    descripcionAlerta: 'Próximo a vencer'
  };

  beforeEach(async () => {
    gerenciaService = {
      obtenerReglas: vi.fn().mockReturnValue(of([])),
      obtenerAuditoriaAlertas: vi.fn().mockReturnValue(of([]))
    };
    apiService = {
      getCategorias: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardControlComponent],
      providers: [
        provideRouter([]),
        { provide: GerenciaService, useValue: gerenciaService },
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardControlComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should only keep PENDIENTE and OMITIDA alerts (alerts happening right now)', () => {
    gerenciaService.obtenerAuditoriaAlertas.mockReturnValue(of([
      { ...alertaBase, id: 1, estadoAlerta: 'PENDIENTE' },
      { ...alertaBase, id: 2, estadoAlerta: 'OMITIDA' },
      { ...alertaBase, id: 3, estadoAlerta: 'ATENDIDA_A_TIEMPO' },
      { ...alertaBase, id: 4, estadoAlerta: 'ATENDIDA_CON_RETRASO' }
    ] as AlertaAuditoria[]));

    fixture.detectChanges();

    expect(component.alertas.map(a => a.id)).toEqual([1, 2]);
    expect(component.cargandoAlertas).toBe(false);
  });

  it('should show an empty list when there are no active alerts', () => {
    gerenciaService.obtenerAuditoriaAlertas.mockReturnValue(of([
      { ...alertaBase, id: 4, estadoAlerta: 'ATENDIDA_CON_RETRASO' }
    ] as AlertaAuditoria[]));

    fixture.detectChanges();

    expect(component.alertas).toEqual([]);
  });

  it('should set an error message when loading alerts fails', () => {
    gerenciaService.obtenerAuditoriaAlertas.mockReturnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(component.mensajeErrorAlertas).toBe('Error al cargar las alertas.');
    expect(component.cargandoAlertas).toBe(false);
  });
});
