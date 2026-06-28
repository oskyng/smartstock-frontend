import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ReglaDepreciacionResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './config.component.html'
})
export class ConfigComponent implements OnInit {
  rules: ReglaDepreciacionResponse[] = [];
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getDashboard().subscribe({
      next: (data) => {
        this.rules = Array.isArray(data.reglasActivas) ? data.reglasActivas : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar reglas de depreciación.';
        this.loading = false;
      }
    });
  }
}
