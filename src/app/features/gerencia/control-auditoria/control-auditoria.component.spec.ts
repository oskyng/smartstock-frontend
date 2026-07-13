import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { ControlAuditoriaComponent } from './control-auditoria.component';
import { GerenciaService, AlertaAuditoria } from '../services/gerencia.service';
import { AlertService } from '../../alertas/services/alert.service';
import { AuditStreamService } from '../../../core/services/audit-stream.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

describe('ControlAuditoriaComponent', () => {
  let component: ControlAuditoriaComponent;
  let fixture: ComponentFixture<ControlAuditoriaComponent>;
  let gerenciaService: any;
  let alertService: any;
  let auditStream: any;
  let authService: any;
  let toastService: any;
  let sseEvents$: Subject<any>;
  let sseState$: Subject<any>;

  const mockAlertas: AlertaAuditoria[] = [
    { id: 1, loteId: 10, productoNombre: 'Yogurt', codigoBarra: '111', usuarioAsignadoId: 5, usuarioAsignadoNombre: 'Diego Silva', estadoAlerta: 'PENDIENTE', fechaLimiteAtencion: '2026-07-13T10:00:00', fechaAtencion: null, descripcionAlerta: 'desc' },
    { id: 2, loteId: 11, productoNombre: 'Leche', codigoBarra: '222', usuarioAsignadoId: 5, usuarioAsignadoNombre: 'Diego Silva', estadoAlerta: 'ATENDIDA_A_TIEMPO', fechaLimiteAtencion: '2026-07-12T10:00:00', fechaAtencion: '2026-07-12T09:00:00', descripcionAlerta: 'desc' },
    { id: 3, loteId: 12, productoNombre: 'Queso', codigoBarra: '333', usuarioAsignadoId: 6, usuarioAsignadoNombre: 'Ana Gomez', estadoAlerta: 'ATENDIDA_CON_RETRASO', fechaLimiteAtencion: '2026-07-12T10:00:00', fechaAtencion: '2026-07-12T12:30:00', descripcionAlerta: 'desc' },
    { id: 4, loteId: 13, productoNombre: 'Pan', codigoBarra: '444', usuarioAsignadoId: 6, usuarioAsignadoNombre: 'Ana Gomez', estadoAlerta: 'ESCALADA_AL_GERENTE', fechaLimiteAtencion: '2020-01-01T10:00:00', fechaAtencion: null, descripcionAlerta: 'desc' }
  ];

  beforeEach(async () => {
    sseEvents$ = new Subject();
    sseState$ = new Subject();

    gerenciaService = {
      obtenerAuditoriaAlertas: vi.fn().mockReturnValue(of(mockAlertas))
    };
    alertService = {
      atenderAlerta: vi.fn().mockReturnValue(of(undefined))
    };
    auditStream = {
      connect: vi.fn().mockReturnValue(sseEvents$.asObservable()),
      onConnectionState: vi.fn().mockReturnValue(sseState$.asObservable()),
      disconnect: vi.fn()
    };
    authService = {
      getUser: vi.fn().mockReturnValue({ email: 'gerente@test.cl', rol: 'GERENTE_TIENDA', idComercio: 2 })
    };
    toastService = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ControlAuditoriaComponent],
      providers: [
        { provide: GerenciaService, useValue: gerenciaService },
        { provide: AlertService, useValue: alertService },
        { provide: AuditStreamService, useValue: auditStream },
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlAuditoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load the audit list on init', () => {
    expect(component).toBeTruthy();
    expect(gerenciaService.obtenerAuditoriaAlertas).toHaveBeenCalled();
    expect(component.alertas).toEqual(mockAlertas);
    expect(component.cargando).toBe(false);
  });

  it('should set error on load failure', () => {
    gerenciaService.obtenerAuditoriaAlertas.mockReturnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.cargarAuditoria();
    expect(component.error).toBe('fail');
    expect(component.cargando).toBe(false);
  });

  it('KPI getters should count each estado correctly', () => {
    expect(component.kpiPendientes).toBe(1);
    expect(component.kpiATiempo).toBe(1);
    expect(component.kpiConRetraso).toBe(1);
    expect(component.kpiEscaladas).toBe(1);
  });

  it('responsables should list unique assigned users', () => {
    expect(component.responsables).toEqual([
      { id: 5, nombre: 'Diego Silva' },
      { id: 6, nombre: 'Ana Gomez' }
    ]);
  });

  it('filtroResponsableId should filter the list and recompute KPIs', () => {
    component.filtroResponsableId = 6;
    component.onFiltroChange();
    expect(component.alertasFiltradas.length).toBe(2);
    expect(component.kpiPendientes).toBe(0);
    expect(component.kpiConRetraso).toBe(1);
    expect(component.kpiEscaladas).toBe(1);
  });

  it('filtroEstado should filter the list', () => {
    component.filtroEstado = 'ESCALADA_AL_GERENTE';
    component.onFiltroChange();
    expect(component.alertasFiltradas.length).toBe(1);
    expect(component.alertasFiltradas[0].id).toBe(4);
  });

  it('limpiarFiltros should reset both filters and recompute the list', () => {
    component.filtroResponsableId = 6;
    component.filtroEstado = 'PENDIENTE';
    component.onFiltroChange();
    component.limpiarFiltros();
    expect(component.filtroResponsableId).toBeNull();
    expect(component.filtroEstado).toBeNull();
    expect(component.alertasFiltradas.length).toBe(mockAlertas.length);
  });

  it('calcularRetraso should return null for states without delay', () => {
    expect(component.calcularRetraso(mockAlertas[0])).toBeNull();
    expect(component.calcularRetraso(mockAlertas[1])).toBeNull();
  });

  it('calcularRetraso should compute a positive delay for ATENDIDA_CON_RETRASO', () => {
    const retraso = component.calcularRetraso(mockAlertas[2]);
    expect(retraso).toBe('+2 horas tarde');
  });

  it('calcularRetraso should compute a delay for an open ESCALADA_AL_GERENTE alert relative to now', () => {
    const retraso = component.calcularRetraso(mockAlertas[3]);
    expect(retraso).toMatch(/tarde$/);
  });

  it('abrirIntervencion/cerrarModal should toggle modal state', () => {
    component.abrirIntervencion(mockAlertas[3]);
    expect(component.mostrarModal).toBe(true);
    expect(component.alertaSeleccionada).toEqual(mockAlertas[3]);

    component.cerrarModal();
    expect(component.mostrarModal).toBe(false);
    expect(component.alertaSeleccionada).toBeNull();
  });

  it('confirmarIntervencion should call atenderAlerta and reload the list', () => {
    component.abrirIntervencion(mockAlertas[3]);
    component.confirmarIntervencion();
    expect(alertService.atenderAlerta).toHaveBeenCalledWith(4);
    expect(toastService.success).toHaveBeenCalled();
    expect(component.mostrarModal).toBe(false);
    expect(gerenciaService.obtenerAuditoriaAlertas).toHaveBeenCalledTimes(2);
  });

  it('confirmarIntervencion should show a toast error on failure', () => {
    alertService.atenderAlerta.mockReturnValue(throwError(() => ({ error: { message: 'No autorizado' } })));
    component.abrirIntervencion(mockAlertas[3]);
    component.confirmarIntervencion();
    expect(toastService.error).toHaveBeenCalledWith('No autorizado');
    expect(component.guardandoIntervencion).toBe(false);
  });

  it('should ignore SSE events from other comercios', () => {
    sseEvents$.next({ alertaId: 99, loteId: 1, productoNombre: 'Otro', comercioId: 999, descripcion: '', fechaEscalamiento: '' });
    expect(toastService.error).not.toHaveBeenCalled();
    expect(component.alertasParpadeando.has(99)).toBe(false);
  });

  it('should flash the row and reload the list on a matching SSE escalation event', () => {
    sseEvents$.next({ alertaId: 4, loteId: 13, productoNombre: 'Pan', comercioId: 2, descripcion: 'SLA vencido', fechaEscalamiento: '' });
    expect(toastService.error).toHaveBeenCalled();
    expect(component.alertasParpadeando.has(4)).toBe(true);
    expect(gerenciaService.obtenerAuditoriaAlertas).toHaveBeenCalledTimes(2);
  });

  it('should track the SSE connection state', () => {
    sseState$.next('connected');
    expect(component.streamEstado).toBe('connected');
  });

  it('should disconnect the SSE stream on destroy', () => {
    component.ngOnDestroy();
    expect(auditStream.disconnect).toHaveBeenCalled();
  });
});
