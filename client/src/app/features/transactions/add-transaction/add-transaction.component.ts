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
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .add-tx-container {
      max-width: 520px;
      margin: 0 auto;
    }

    .back-btn {
      color: var(--text-secondary) !important;
      font-size: 0.8rem !important;
      margin-bottom: 1.5rem;
    }

    .page-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 1.75rem;
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 28px;
    }

    .type-section-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .type-toggle-group {
      width: 100%;
      margin-bottom: 1.75rem !important;
      border-radius: var(--radius-md) !important;
    }

    .type-toggle {
      flex: 1;
      font-family: 'Inter', sans-serif !important;
      font-weight: 600 !important;
      font-size: 0.82rem !important;
      letter-spacing: 0.04em !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
    }

    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .submit-btn {
      background: linear-gradient(135deg, var(--accent), #0099CC) !important;
      color: #000 !important;
      font-weight: 700 !important;
      letter-spacing: 0.02em !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 0 16px var(--accent-glow) !important;
      height: 42px !important;
      padding: 0 28px !important;
      margin-top: 1rem;
    }

    .submit-btn.sell-btn {
      background: linear-gradient(135deg, var(--negative), #c0392b) !important;
      box-shadow: 0 0 16px rgba(240,82,82,0.3) !important;
      color: #fff !important;
    }

    .submit-btn.dividend-btn {
      background: var(--accent-dim) !important;
      border: 1px solid var(--border-accent) !important;
      color: var(--accent) !important;
      box-shadow: none !important;
    }
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
