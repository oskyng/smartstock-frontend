import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { KafkaLog } from '../../core/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-infra-diag',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './infra-diag.component.html'
})
export class InfraDiagComponent implements OnInit {
  kafkaLogs: KafkaLog[] = [];

  constructor(private mockService: MockDataService) {}

  ngOnInit() {
    this.mockService.getKafkaLogs().subscribe(data => this.kafkaLogs = data);
  }
}
