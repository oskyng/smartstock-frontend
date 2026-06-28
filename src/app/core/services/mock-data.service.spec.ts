import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';
import { firstValueFrom } from 'rxjs';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return products', async () => {
    const products = await firstValueFrom(service.getProducts());
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].sku).toBeDefined();
  });

  it('should return alerts', async () => {
    const alerts = await firstValueFrom(service.getAlerts());
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('should return control events', async () => {
    const events = await firstValueFrom(service.getControlEvents());
    expect(events.length).toBeGreaterThan(0);
  });

  it('should return tenants', async () => {
    const tenants = await firstValueFrom(service.getTenants());
    expect(tenants.length).toBeGreaterThan(0);
  });

  it('should return kafka logs', async () => {
    const logs = await firstValueFrom(service.getKafkaLogs());
    expect(logs.length).toBeGreaterThan(0);
  });
});
