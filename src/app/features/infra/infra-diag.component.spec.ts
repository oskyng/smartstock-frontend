import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfraDiagComponent } from './infra-diag.component';
import { ApiService, InfraStatus } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('InfraDiagComponent', () => {
  let component: InfraDiagComponent;
  let fixture: ComponentFixture<InfraDiagComponent>;
  let apiService: any;

  const mockStatus: InfraStatus = {
    timestamp: '2026-07-16T12:00:00',
    servicios: [
      { nombre: 'auth-service', url: 'http://localhost:8081', estado: 'UP', estadoBaseDatos: 'UP', latenciaMs: 12, detalle: null }
    ],
    kafkaEstado: 'OPERACIONAL',
    kafkaNodos: 1,
    topicos: [
      { nombre: 'lote-creado', particiones: 1, factorReplicacion: 1, gruposConsumidores: [] }
    ]
  };

  beforeEach(async () => {
    apiService = {
      getInfraStatus: vi.fn().mockReturnValue(of(mockStatus))
    };

    await TestBed.configureTestingModule({
      imports: [InfraDiagComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InfraDiagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load infra status on init', () => {
    expect(apiService.getInfraStatus).toHaveBeenCalled();
    expect(component.servicios).toEqual(mockStatus.servicios);
    expect(component.topicos).toEqual(mockStatus.topicos);
    expect(component.cargando).toBe(false);
  });

  it('should flag error state when the request fails', () => {
    apiService.getInfraStatus.mockReturnValue(throwError(() => new Error('down')));

    component.cargarEstado();

    expect(component.error).toBe(true);
    expect(component.cargando).toBe(false);
  });
});
