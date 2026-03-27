import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TransactionsStore } from '../store/transactions.store';
import { NotificationService } from '../../../core/services/notification.service';
import { TransactionType } from '../services/transactions.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [TransactionsStore],
  template: `
    <div class="add-tx-container">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Back
      </button>

      <h1>Add Transaction</h1>

      <mat-button-toggle-group [value]="selectedType" (change)="onTypeChange($event.value)">
        <mat-button-toggle value="Buy">Buy</mat-button-toggle>
        <mat-button-toggle value="Sell">Sell</mat-button-toggle>
        <mat-button-toggle value="Dividend">Dividend</mat-button-toggle>
      </mat-button-toggle-group>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" [max]="today" />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>

        @if (selectedType === 'Buy' || selectedType === 'Sell') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Units</mat-label>
            <input matInput type="number" formControlName="units" min="0.0001" step="0.0001" />
            @if (form.get('units')?.hasError('min')) {
              <mat-error>Units must be greater than zero</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Price per unit</mat-label>
            <input matInput type="number" formControlName="pricePerUnit" min="0.0001" step="0.01" />
            @if (form.get('pricePerUnit')?.hasError('min')) {
              <mat-error>Price must be greater than zero</mat-error>
            }
          </mat-form-field>
        }

        @if (selectedType === 'Dividend') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dividend amount</mat-label>
            <input matInput type="number" formControlName="dividendAmount" min="0.0001" step="0.01" />
            @if (form.get('dividendAmount')?.hasError('min')) {
              <mat-error>Amount must be greater than zero</mat-error>
            }
          </mat-form-field>
        }

        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          Record {{ selectedType }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .add-tx-container {
      max-width: 480px;
      margin: 1rem auto;
      padding: 0 1rem;
    }
    .form { margin-top: 1.5rem; }
    .full-width { width: 100%; margin-bottom: 1rem; }
    mat-button-toggle-group { margin-bottom: 1.5rem; }
  `],
})
export class AddTransactionComponent implements OnInit {
  protected readonly store = inject(TransactionsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  protected selectedType: TransactionType = 'Buy';
  protected readonly today = new Date();

  private watchlistId = '';
  private holdingId = '';

  protected readonly form = this.fb.nonNullable.group({
    date: [new Date(), Validators.required],
    units: [0, [Validators.min(0.0001)]],
    pricePerUnit: [0, [Validators.min(0.0001)]],
    dividendAmount: [0, [Validators.min(0.0001)]],
  });

  ngOnInit(): void {
    this.watchlistId = this.route.snapshot.paramMap.get('watchlistId') ?? '';
    this.holdingId = this.route.snapshot.paramMap.get('holdingId') ?? '';
  }

  protected onTypeChange(type: TransactionType): void {
    this.selectedType = type;
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    const { date, units, pricePerUnit, dividendAmount } = this.form.getRawValue();
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;

    const isBuySell = this.selectedType === 'Buy' || this.selectedType === 'Sell';

    this.store.addTransaction({
      type: this.selectedType,
      transactionDate: dateStr,
      units: isBuySell ? units : null,
      pricePerUnit: isBuySell ? pricePerUnit : null,
      dividendAmount: this.selectedType === 'Dividend' ? dividendAmount : null,
    });

    this.notification.showSuccess(`${this.selectedType} transaction recorded`);
    this.goBack();
  }

  protected goBack(): void {
    this.router.navigate(['/transactions', this.watchlistId, this.holdingId]);
  }
}
