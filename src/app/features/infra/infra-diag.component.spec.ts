import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfraDiagComponent } from './infra-diag.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { of } from 'rxjs';

describe('InfraDiagComponent', () => {
  let component: InfraDiagComponent;
  let fixture: ComponentFixture<InfraDiagComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getKafkaLogs: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [InfraDiagComponent],
      providers: [
        { provide: MockDataService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InfraDiagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load kafka logs on init', () => {
    const mockLogs = [{ timestamp: '2024-01-01', topic: 'test' }];
    mockService.getKafkaLogs.mockReturnValue(of(mockLogs));

    component.ngOnInit();

    expect(component.kafkaLogs).toEqual(mockLogs);
    expect(mockService.getKafkaLogs).toHaveBeenCalled();
  });
});
