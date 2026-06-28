import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGlobalComponent } from './admin-global.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { of } from 'rxjs';

describe('AdminGlobalComponent', () => {
  let component: AdminGlobalComponent;
  let fixture: ComponentFixture<AdminGlobalComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getTenants: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [AdminGlobalComponent],
      providers: [
        { provide: MockDataService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tenants on init', () => {
    const mockTenants = [{ id: 'TEN-001', razonSocial: 'Test Tenant' }];
    mockService.getTenants.mockReturnValue(of(mockTenants));

    component.ngOnInit();

    expect(component.tenants).toEqual(mockTenants);
    expect(mockService.getTenants).toHaveBeenCalled();
  });
});
