import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GerenciaService, AlertaAuditoria, EstadoAlertaAuditoria } from '../services/gerencia.service';
import { AlertService } from '../../alertas/services/alert.service';
import { AuditStreamService, AlertaEscaladaEvent, StreamConnectionState } from '../../../core/services/audit-stream.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../../shared/components/skeleton-rows/skeleton-rows.component';

interface Responsable {
  id: number;
  nombre: string;
}

const ESTADOS: { valor: EstadoAlertaAuditoria; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'ATENDIDA_A_TIEMPO', etiqueta: 'Atendida a Tiempo' },
  { valor: 'ATENDIDA_CON_RETRASO', etiqueta: 'Atendida con Retraso' },
  { valor: 'OMITIDA', etiqueta: 'Omitida' }
];

@Component({
  selector: 'app-control-auditoria',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonRowsComponent
  ],
  templateUrl: './control-auditoria.component.html',
  styleUrl: './control-auditoria.component.css'
})
export class ControlAuditoriaComponent implements OnInit, OnDestroy {
  readonly estados = ESTADOS;

  alertas: AlertaAuditoria[] = [];
  alertasFiltradas: AlertaAuditoria[] = [];
  responsables: Responsable[] = [];
  cargando = true;
  error: string | null = null;

  filtroResponsableId: number | null = null;
  filtroEstado: EstadoAlertaAuditoria | null = null;

  /** Estado de la conexión SSE en vivo (indicador "en vivo"/"reconectando" en pantalla). */
  streamEstado: StreamConnectionState = 'disconnected';
  /** IDs de alertas recién escaladas por SSE, para el efecto de parpadeo en la fila. */
  alertasParpadeando = new Set<number>();

  mostrarModal = false;
  alertaSeleccionada: AlertaAuditoria | null = null;
  notaIntervencion = '';
  guardandoIntervencion = false;

  private comercioId: number | null;
  private subscripciones = new Subscription();

  constructor(
    private gerenciaService: GerenciaService,
    private alertService: AlertService,
    private auditStream: AuditStreamService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.comercioId = this.authService.getUser()?.idComercio ?? null;
  }

  ngOnInit(): void {
    this.cargarAuditoria();
    this.conectarStreamAuditoria();
  }

  ngOnDestroy(): void {
    this.subscripciones.unsubscribe();
    this.auditStream.disconnect();
  }

  cargarAuditoria(): void {
    this.cargando = true;
    this.error = null;

    this.gerenciaService.obtenerAuditoriaAlertas().subscribe({
      next: (data) => {
        this.alertas = Array.isArray(data) ? data : [];
        this.recalcularVista();
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Error al cargar la auditoría de alertas.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Recalcula `responsables` (para el filtro) y `alertasFiltradas` (para la tabla y los KPI)
   * como campos estables, en vez de getters: un getter que retorna un array nuevo en cada
   * ciclo de detección de cambios, ligado a *ngFor/ngModel, dispara NG0103 (loop infinito de CD).
   */
  private recalcularVista(): void {
    const mapa = new Map<number, string>();
    for (const a of this.alertas) {
      if (a.usuarioAsignadoId !== null && !mapa.has(a.usuarioAsignadoId)) {
        mapa.set(a.usuarioAsignadoId, a.usuarioAsignadoNombre);
      }
    }
    this.responsables = Array.from(mapa, ([id, nombre]) => ({ id, nombre }));

    this.alertasFiltradas = this.alertas.filter(a =>
      (this.filtroResponsableId === null || a.usuarioAsignadoId === this.filtroResponsableId) &&
      (this.filtroEstado === null || a.estadoAlerta === this.filtroEstado)
    );
  }

  onFiltroChange(): void {
    this.recalcularVista();
    this.cdr.markForCheck();
  }

  get kpiPendientes(): number {
    return this.alertasFiltradas.filter(a => a.estadoAlerta === 'PENDIENTE').length;
  }

  get kpiATiempo(): number {
    return this.alertasFiltradas.filter(a => a.estadoAlerta === 'ATENDIDA_A_TIEMPO').length;
  }

  get kpiConRetraso(): number {
    return this.alertasFiltradas.filter(a => a.estadoAlerta === 'ATENDIDA_CON_RETRASO').length;
  }

  get kpiOmitidas(): number {
    return this.alertasFiltradas.filter(a => a.estadoAlerta === 'OMITIDA').length;
  }

  limpiarFiltros(): void {
    this.filtroResponsableId = null;
    this.filtroEstado = null;
    this.recalcularVista();
  }

  /** Etiqueta de estado legible para el badge. */
  etiquetaEstado(estado: EstadoAlertaAuditoria): string {
    return ESTADOS.find(e => e.valor === estado)?.etiqueta ?? estado;
  }

  /**
   * Indicador de SLA: si la atención (real o, para alertas aún abiertas, "ahora") ocurrió
   * después del límite, devuelve un texto tipo "+2 horas tarde"; si no hay retraso, null.
   */
  calcularRetraso(alerta: AlertaAuditoria): string | null {
    if (alerta.estadoAlerta !== 'ATENDIDA_CON_RETRASO' && alerta.estadoAlerta !== 'OMITIDA') {
      return null;
    }
    const limite = new Date(alerta.fechaLimiteAtencion).getTime();
    const referencia = alerta.fechaAtencion ? new Date(alerta.fechaAtencion).getTime() : Date.now();
    const diffMs = referencia - limite;
    if (diffMs <= 0) {
      return null;
    }
    const horas = Math.floor(diffMs / 3_600_000);
    const minutos = Math.floor((diffMs % 3_600_000) / 60_000);
    if (horas >= 1) {
      return `+${horas} hora${horas === 1 ? '' : 's'} tarde`;
    }
    return `+${minutos} min tarde`;
  }

  abrirIntervencion(alerta: AlertaAuditoria): void {
    this.alertaSeleccionada = alerta;
    this.notaIntervencion = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    if (this.guardandoIntervencion) {
      return;
    }
    this.mostrarModal = false;
    this.alertaSeleccionada = null;
    this.notaIntervencion = '';
  }

  confirmarIntervencion(): void {
    if (!this.alertaSeleccionada) {
      return;
    }
    const id = this.alertaSeleccionada.id;
    const producto = this.alertaSeleccionada.productoNombre;

    this.guardandoIntervencion = true;
    this.alertService.atenderAlerta(id).subscribe({
      next: () => {
        this.toast.success(`Intervención registrada: lote de "${producto}" resuelto por el gerente.`);
        this.guardandoIntervencion = false;
        this.mostrarModal = false;
        this.alertaSeleccionada = null;
        this.notaIntervencion = '';
        this.cargarAuditoria();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg: string = err.error?.message || 'Error al intervenir la alerta.';
        this.toast.error(msg);
        this.guardandoIntervencion = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Conecta al canal SSE de auditoría (GET /api/v1/bff/audit/stream). El stream no filtra por
   * comercio en el backend, así que se descartan aquí los eventos de otros comercios. Cuando
   * llega una escalada del propio comercio, la fila parpadea y el listado se refresca en caliente.
   */
  private conectarStreamAuditoria(): void {
    this.subscripciones.add(
      this.auditStream.onConnectionState().subscribe(state => {
        this.streamEstado = state;
        this.cdr.markForCheck();
      })
    );

    this.subscripciones.add(
      this.auditStream.connect().subscribe((evento: AlertaEscaladaEvent) => {
        if (this.comercioId !== null && evento.comercioId !== this.comercioId) {
          return;
        }

        this.toast.error(
          `⚠ Alerta escalada: "${evento.productoNombre}" superó el SLA de 24h. ${evento.descripcion}`,
          8000
        );

        this.alertasParpadeando.add(evento.alertaId);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.alertasParpadeando.delete(evento.alertaId);
          this.cdr.markForCheck();
        }, 3000);

        this.cargarAuditoria();
      })
    );
  }
}
