import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AddTransactionComponent } from './add-transaction.component';
import { TransactionsService } from '../services/transactions.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('AddTransactionComponent', () => {
  let fixture: ComponentFixture<AddTransactionComponent>;
  let component: AddTransactionComponent;

  beforeEach(async () => {
    const transactionServiceMock = {
      list: jest.fn().mockReturnValue(of([])),
      add: jest.fn().mockReturnValue(of({})),
    };

    const notificationMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AddTransactionComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TransactionsService, useValue: transactionServiceMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to Buy type', () => {
    expect((component as any).selectedType).toBe('Buy');
  });

  it('should show units and price fields for Buy', () => {
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('mat-label');
    const labelTexts = Array.from(labels).map((el: any) => el.textContent);
    expect(labelTexts).toContain('Units');
    expect(labelTexts).toContain('Price per unit');
  });

  it('should switch to Dividend type on toggle', () => {
    (component as any).onTypeChange('Dividend');
    fixture.detectChanges();

    expect((component as any).selectedType).toBe('Dividend');
  });

  it('form should be invalid without required fields', () => {
    const form = (component as any).form;
    form.get('units').setValue(0);
    form.get('pricePerUnit').setValue(0);
    form.get('dividendAmount').setValue(0);
    fixture.detectChanges();

    expect(form.valid).toBe(false);
  });
});
