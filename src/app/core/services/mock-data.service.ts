import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { Product, Alert, ControlEvent, Tenant, KafkaLog } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  getProducts(): Observable<Product[]> {
    return of([
      { id: '1', sku: 'OL-001', name: 'Aceite de Oliva Extra Virgen 1L', category: 'Abarrotes', stock: 45, status: 'Optimo', barcode: '7801234567890' },
      { id: '2', sku: 'AR-001', name: 'Arroz Grado 1 XL 1kg', category: 'Abarrotes', stock: 8, status: 'Critico', barcode: '7804567890123' },
      { id: '3', sku: 'DL-001', name: 'Detergente Líquido 3L', category: 'Limpieza', stock: 24, status: 'Optimo', barcode: '7809876543210' },
      { id: '4', sku: 'LE-001', name: 'Leche Entera Caja 1L', category: 'Lácteos', stock: 62, status: 'Optimo', barcode: '7802468135790' },
      { id: '5', sku: 'PH-001', name: 'Papel Higiénico 12 Rollos', category: 'Hogar', stock: 12, status: 'Bajo', barcode: '7801357924680' },
    ]);
  }

  getAlerts(): Observable<Alert[]> {
    return of([
      { id: '1', type: 'Lote Critico', sku: 'PROD-9921-X', lote: 'L-2023-004', venceEn: '24 Horas', ubicacion: 'PASILLO A / ESTANTE 4', perdidaPotencial: '$1,250.00 USD', priority: 'Alta' },
      { id: '2', type: 'Pre-alerta', sku: 'PROD-1145-B', lote: 'L-2023-089', venceEn: '7 Días', ubicacion: 'PASILLO C / SECCIÓN 2', priority: 'Media' },
    ]);
  }

  getControlEvents(): Observable<ControlEvent[]> {
    return of([
      { id: '1', product: 'Leche Entera 1L', sku: 'EV-001', lote: 'L-2023-098', operario: 'Carlos Ruiz', operarioAvatar: 'https://i.pravatar.cc/150?u=carlos', priority: 'Alta', status: 'Critico', bitacora: 'Fecha de vencimiento próxima (48h). Se requiere...' },
      { id: '2', product: 'Aceite de Girasol 900ml', sku: 'EV-002', lote: 'L-2023-112', operario: 'Marta Gómez', operarioAvatar: 'https://i.pravatar.cc/150?u=marta', priority: 'Media', status: 'Regular', bitacora: 'Rotura de envase en góndola. Producto mermado' },
    ]);
  }

  getTenants(): Observable<Tenant[]> {
    return of([
      { id: 'TEN-001', rut: '21.456.789-0', razonSocial: 'Distribuidora Nacional S.A.', sucursales: 12, usuarios: 45, status: 'Activo' },
      { id: 'TEN-002', rut: '21.987.654-K', razonSocial: 'Logística del Sur Ltda.', sucursales: 4, usuarios: 18, status: 'Activo' },
      { id: 'TEN-003', rut: '21.321.654-2', razonSocial: 'Retail Global Corp.', sucursales: 28, usuarios: 112, status: 'Inactivo' },
    ]);
  }

  getKafkaLogs(): Observable<KafkaLog[]> {
    return of([
      { timestamp: '2024-05-20 14:32:01.442', topic: 'inventory.update.v1', partition: 'P02', payload: '{"event_id": "99A1", "sku": "SS-772", "qty": 150}' },
      { timestamp: '2024-05-20 14:31:58.112', topic: 'orders.checkout.realtime', partition: 'P05', payload: '{"order_id": "ORD-552", "status": "COMPLETED"}' },
    ]);
  }
}
