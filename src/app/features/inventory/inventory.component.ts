import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ProductoResponse } from '../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  products: ProductoResponse[] = [];
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getProductos().subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar productos.';
        this.loading = false;
      }
    });
  }
}
