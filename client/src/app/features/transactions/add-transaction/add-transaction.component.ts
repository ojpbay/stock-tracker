import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    dividendAmount: [0, []],
  });

  ngOnInit(): void {
    this.watchlistId = this.route.snapshot.paramMap.get('watchlistId') ?? '';
    this.holdingId = this.route.snapshot.paramMap.get('holdingId') ?? '';
    this.store.setContext({ watchlistId: this.watchlistId, holdingId: this.holdingId });
  }

  protected onTypeChange(type: TransactionType): void {
    this.selectedType = type;
    const { units, pricePerUnit, dividendAmount } = this.form.controls;
    if (type === 'Buy' || type === 'Sell') {
      units.setValidators([Validators.min(0.0001)]);
      pricePerUnit.setValidators([Validators.min(0.0001)]);
      dividendAmount.clearValidators();
    } else {
      dividendAmount.setValidators([Validators.min(0.0001)]);
      units.clearValidators();
      pricePerUnit.clearValidators();
    }
    units.updateValueAndValidity();
    pricePerUnit.updateValueAndValidity();
    dividendAmount.updateValueAndValidity();
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
