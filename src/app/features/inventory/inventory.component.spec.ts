import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryComponent } from './inventory.component';
import { ApiService } from '../../core/services/api.service';
import { of, throwError } from 'rxjs';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let apiService: any;

  beforeEach(async () => {
    apiService = {
      getProductos: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const mockProducts = [{ id: 1, nombre: 'Producto 1', codigoBarra: '123', nombreCategoria: 'Cat', precioBase: 50 }];
    apiService.getProductos.mockReturnValue(of(mockProducts));

    component.ngOnInit();

    expect(component.products).toEqual(mockProducts);
    expect(apiService.getProductos).toHaveBeenCalled();
  });

  it('should set error on load failure', () => {
    apiService.getProductos.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar productos.');
    expect(component.loading).toBe(false);
  });
});
