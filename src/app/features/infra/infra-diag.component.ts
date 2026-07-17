import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, InfraStatus, ServiceHealth, KafkaTopicInfo } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonRowsComponent } from '../../shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-infra-diag',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, SkeletonRowsComponent],
  templateUrl: './infra-diag.component.html'
})
export class InfraDiagComponent implements OnInit {
  infraStatus: InfraStatus | null = null;
  servicios: ServiceHealth[] = [];
  topicos: KafkaTopicInfo[] = [];
  cargando = true;
  error = false;
  ultimaActualizacion: Date | null = null;

  readonly columnasTopicos = ['nombre', 'particiones', 'factorReplicacion', 'gruposConsumidores'];

  constructor(private apiService: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarEstado();
  }

  cargarEstado() {
    this.cargando = true;
    this.error = false;
    this.apiService.getInfraStatus().subscribe({
      next: (data) => {
        this.infraStatus = data;
        this.servicios = data.servicios;
        this.topicos = data.topicos;
        this.ultimaActualizacion = new Date();
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
        this.toast.error('No se pudo obtener el estado de infraestructura');
        this.cdr.markForCheck();
      }
    });
  }

  gruposConsumidoresTexto(topico: KafkaTopicInfo): string {
    if (!topico.gruposConsumidores || topico.gruposConsumidores.length === 0) {
      return 'Sin grupos activos';
    }
    return topico.gruposConsumidores.map(g => `${g.groupId} (${g.estado})`).join(', ');
  }

  get baseDatosEstado(): string {
    const servicioConDb = this.servicios.find(s => s.estadoBaseDatos);
    return servicioConDb?.estadoBaseDatos ?? 'DESCONOCIDO';
  }
}
