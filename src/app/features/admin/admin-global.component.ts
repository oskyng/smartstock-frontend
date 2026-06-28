import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { Tenant } from '../../core/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-admin-global',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './admin-global.component.html'
})
export class AdminGlobalComponent implements OnInit {
  tenants: Tenant[] = [];

  constructor(private mockService: MockDataService) {}

  ngOnInit() {
    this.mockService.getTenants().subscribe(data => this.tenants = data);
  }
}
