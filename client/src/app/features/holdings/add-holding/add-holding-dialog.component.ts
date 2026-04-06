import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit, ViewChild, afterNextRender, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardStore } from '../../dashboard/store/dashboard.store';
import { StockSearchResult } from '../../stocks/services/stocks.service';
import { StocksStore } from '../../stocks/store/stocks.store';
import { HoldingsService } from '../services/holdings.service';

export interface AddHoldingDialogData {
  watchlistId: string;
  /** When provided, Step 1 (search) is skipped and the dialog starts at Step 2. */
  symbol?: string;
  companyName?: string;
  exchange?: string;
}



interface SelectedStock {
  symbol: string;
  companyName: string;
  exchange: string;
}

@Component({
  selector: 'app-add-holding-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  providers: [StocksStore, provideNativeDateAdapter()],
  templateUrl: './add-holding-dialog.component.html',
  styleUrl: './add-holding-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddHoldingDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') private stepper!: MatStepper;

  private readonly injector = inject(Injector);
  protected readonly store = inject(StocksStore);
  private readonly dialogRef = inject(MatDialogRef<AddHoldingDialogComponent>);
  protected readonly data = inject<AddHoldingDialogData>(MAT_DIALOG_DATA);
  private readonly holdingsService = inject(HoldingsService);
  private readonly dashboardStore = inject(DashboardStore);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly searchControl = new FormControl('');
  protected readonly selectedStock = signal<SelectedStock | null>(null);
  protected readonly submitting = signal(false);
  protected readonly currentStep = signal(0);
  protected readonly today = new Date();

  protected readonly purchaseForm = this.fb.nonNullable.group({
    units: [0 as number, [Validators.required, Validators.min(0.0001)]],
    pricePerUnit: [0 as number, [Validators.required, Validators.min(0.0001)]],
    purchaseDate: [new Date(), Validators.required],
  });

  ngOnInit(): void {
    if (this.data.symbol) {
      this.selectedStock.set({
        symbol: this.data.symbol,
        companyName: this.data.companyName ?? this.data.symbol,
        exchange: this.data.exchange ?? '',
      });
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      filter((v): v is string => !!v && v.length >= 1),
    ).subscribe((query) => this.store.searchStocks(query));

    this.searchControl.valueChanges.pipe(
      filter((v) => !v),
    ).subscribe(() => this.store.clearResults());
  }

  ngAfterViewInit(): void {
    if (this.data.symbol && this.stepper) {
      afterNextRender(() => {
        this.stepper.next();
        this.currentStep.set(1);
      }, { injector: this.injector });
    }
  }

  protected selectStock(result: StockSearchResult): void {
    this.selectedStock.set({
      symbol: result.symbol,
      companyName: result.companyName,
      exchange: result.exchange,
    });
    this.store.clearResults();
    this.stepper.next();
  }

  protected confirm(): void {
    if (this.purchaseForm.invalid || !this.selectedStock()) return;

    const { units, pricePerUnit, purchaseDate } = this.purchaseForm.getRawValue();
    const dateStr = purchaseDate instanceof Date
      ? purchaseDate.toISOString().split('T')[0]
      : String(purchaseDate);

    this.submitting.set(true);
    this.holdingsService.addHolding(this.data.watchlistId, {
      stockSymbol: this.selectedStock()!.symbol,
      units,
      pricePerUnit,
      purchaseDate: dateStr,
    }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.selectedStock()!.symbol} added to watchlist`);
        this.dashboardStore.loadDashboard(this.data.watchlistId);
        this.dialogRef.close(true);
      },
      error: (err: { error?: { error?: string }; message?: string }) => {
        this.notification.showError(err.error?.error ?? err.message ?? 'Failed to add holding');
        this.submitting.set(false);
      },
    });
  }
}
