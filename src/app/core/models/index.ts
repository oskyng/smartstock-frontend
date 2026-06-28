export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  status: 'Optimo' | 'Critico' | 'Bajo';
  barcode: string;
}

export interface Alert {
  id: string;
  type: 'Lote Critico' | 'Pre-alerta' | 'Vencimiento';
  sku: string;
  lote: string;
  venceEn: string;
  ubicacion: string;
  perdidaPotencial?: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface ControlEvent {
  id: string;
  product: string;
  sku: string;
  lote: string;
  operario: string;
  operarioAvatar: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Critico' | 'Regular' | 'Estable' | 'Revision';
  bitacora: string;
}

export interface Tenant {
  id: string;
  rut: string;
  razonSocial: string;
  sucursales: number;
  usuarios: number;
  status: 'Activo' | 'Inactivo' | 'Pendiente';
}

export interface KafkaLog {
  timestamp: string;
  topic: string;
  partition: string;
  payload: string;
}
