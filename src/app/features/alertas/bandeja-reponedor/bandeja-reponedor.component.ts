import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertService, AlertaResponse } from '../services/alert.service';
import { AuditStreamService, AlertaEscaladaEvent, StreamConnectionState } from '../../../core/services/audit-stream.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { SkeletonCardsComponent } from '../../../shared/components/skeleton-cards/skeleton-cards.component';

@Component({
  selector: 'app-bandeja-reponedor',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule, SkeletonCardsComponent],
  templateUrl: './bandeja-reponedor.component.html'
})
export class BandejaReponedorComponent implements OnInit, OnDestroy {
  alertas: AlertaResponse[] = [];
  cargando = false;
  mensajeError: string | null = null;
  atendiendoId: number | null = null;

  /** Estado de la conexión en vivo (SSE), mostrado como indicador en pantalla. */
  streamEstado: StreamConnectionState = 'disconnected';

  private subscripciones = new Subscription();

  constructor(
    private alertService: AlertService,
    private auditStream: AuditStreamService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
    this.conectarStreamAuditoria();
  }

  /** Mensaje de estado vacío adaptado al rol (CA-07). */
  get mensajeSinAlertas(): string {
    const rol = this.authService.getUser()?.rol;
    return rol === 'REPONEDOR_SALA'
      ? 'Sin alertas pendientes por atender en este comercio.'
      : 'No hay alertas pendientes.';
  }

  ngOnDestroy(): void {
    this.subscripciones.unsubscribe();
    this.auditStream.disconnect();
  }

  cargarAlertas(): void {
    this.cargando = true;
    this.mensajeError = null;

    this.alertService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message ?? 'Error al cargar las alertas.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  marcarAtendida(alerta: AlertaResponse): void {
    this.atendiendoId = alerta.id;

    this.alertService.atenderAlerta(alerta.id).subscribe({
      next: () => {
        this.toast.success(`Alerta #${alerta.id} marcada como atendida.`);
        this.cargarAlertas();
        this.atendiendoId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message ?? 'Error al atender la alerta.';
        this.atendiendoId = null;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Conecta al canal SSE de auditoría (GET /api/v1/bff/audit/stream). Cada vez que
   * el backend escala una alerta por incumplimiento de SLA (24h), refresca el
   * listado en caliente y dispara una notificación visual crítica.
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
        this.toast.error(
          `⚠ Alerta escalada: "${evento.productoNombre}" superó el SLA de 24h. ${evento.descripcion}`,
          8000
        );
        this.cargarAlertas();
      })
    );
  }
}
