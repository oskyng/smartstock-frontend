import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, AlertaResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  alerts: AlertaResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAlertas();
  }

  loadAlertas() {
    this.loading = true;
    this.apiService.getAlertas().subscribe({
      next: (data) => {
        this.alerts = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar alertas.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  atender(id: number) {
    this.apiService.atenderAlerta(id).subscribe({
      next: () => {
        this.toast.success(`Alerta #${id} marcada como atendida.`);
        this.loadAlertas();
      },
      error: () => {
        this.toast.error('Error al atender la alerta.');
        this.cdr.markForCheck();
      }
    });
  }
}
