import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AdminGlobalComponent } from './admin-global.component';
import { AdminService } from './services/admin.service';
import { of } from 'rxjs';

describe('AdminGlobalComponent', () => {
  let component: AdminGlobalComponent;
  let fixture: ComponentFixture<AdminGlobalComponent>;
  let adminService: any;

  beforeEach(async () => {
    adminService = {
      obtenerComercios: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [AdminGlobalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: AdminService, useValue: adminService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load comercios on init', () => {
    const mockComercios = [{ id: 1, rutEmpresa: '76.123.456-7', razonSocial: 'Test Tenant', rubro: 'Retail' }];
    adminService.obtenerComercios.mockReturnValue(of(mockComercios));

    component.ngOnInit();

    expect(component.comercios).toEqual(mockComercios);
    expect(adminService.obtenerComercios).toHaveBeenCalled();
  });
});
