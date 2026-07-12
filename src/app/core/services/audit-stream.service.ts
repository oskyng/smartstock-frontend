import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AlertaEscaladaEvent {
  alertaId: number;
  loteId: number;
  productoNombre: string;
  comercioId: number;
  descripcion: string;
  fechaEscalamiento: string;
}

export type StreamConnectionState = 'connected' | 'disconnected' | 'error';

/**
 * Cliente SSE para GET /api/v1/bff/audit/stream.
 *
 * NOTA IMPORTANTE: el endpoint está protegido con JWT vía header
 * "Authorization: Bearer <token>". El EventSource nativo del navegador
 * NO permite enviar cabeceras personalizadas, por lo que una conexión
 * `new EventSource(url)` sería siempre rechazada con 401/403 por el BFF.
 * Por eso este servicio consume el stream con `fetch` + `ReadableStream`
 * (misma semántica de Server-Sent Events: "data: {...}\n\n"), pero
 * autenticado igual que cualquier otra petición del BFF.
 */
@Injectable({
  providedIn: 'root'
})
export class AuditStreamService implements OnDestroy {
  private readonly API = environment.apiUrl;
  private zone = inject(NgZone);

  private abortController: AbortController | null = null;
  private events$ = new Subject<AlertaEscaladaEvent>();
  private connectionState$ = new Subject<StreamConnectionState>();

  /** Abre (o reabre) la conexión y devuelve el stream de eventos 'alerta-escalada'. */
  connect(): Observable<AlertaEscaladaEvent> {
    this.disconnect();

    const token = localStorage.getItem('ss_token');
    if (!token) {
      this.zone.run(() => this.connectionState$.next('error'));
      return this.events$.asObservable();
    }

    this.abortController = new AbortController();

    fetch(`${this.API}/audit/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream'
      },
      signal: this.abortController.signal
    })
      .then(response => {
        if (!response.ok || !response.body) {
          throw new Error(`No se pudo conectar al stream de auditoría (HTTP ${response.status})`);
        }
        this.zone.run(() => this.connectionState$.next('connected'));
        return this.readStream(response.body.getReader());
      })
      .catch((err: unknown) => {
        const aborted = err instanceof DOMException && err.name === 'AbortError';
        if (!aborted) {
          this.zone.run(() => this.connectionState$.next('error'));
        }
      });

    return this.events$.asObservable();
  }

  /** Estado de la conexión (para mostrar un indicador "en vivo" / reconectando en la UI). */
  onConnectionState(): Observable<StreamConnectionState> {
    return this.connectionState$.asObservable();
  }

  disconnect(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  private async readStream(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';
    let eventDataLines: string[] = [];

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          this.zone.run(() => this.connectionState$.next('disconnected'));
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // La última línea puede estar incompleta: se conserva para el próximo chunk.
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            eventDataLines.push(line.slice(5).trimStart());
          } else if (line.trim() === '' && eventDataLines.length > 0) {
            this.emitEvent(eventDataLines.join('\n'));
            eventDataLines = [];
          }
        }
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      if (!aborted) {
        this.zone.run(() => this.connectionState$.next('error'));
      }
    }
  }

  private emitEvent(raw: string): void {
    try {
      const parsed: AlertaEscaladaEvent = JSON.parse(raw);
      this.zone.run(() => this.events$.next(parsed));
    } catch {
      // Ignora heartbeats/comentarios SSE que no sean JSON de negocio.
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.events$.complete();
    this.connectionState$.complete();
  }
}
