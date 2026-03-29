import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HoldingsService } from '../services/holdings.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-holding',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-holding.component.html',
  styles: [`
    .add-container {
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
      margin-bottom: 4px;
    }

    .page-sub {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 1.75rem;
    }

    .symbol-tag {
      display: inline-block;
      background: var(--accent-dim);
      border: 1px solid var(--border-accent);
      color: var(--accent);
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      padding: 2px 10px;
      border-radius: 4px;
      font-family: 'Inter', monospace;
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 28px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .form-actions {
      margin-top: 1.25rem;
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
    }
  `],
})
export class AddHoldingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly holdingsService = inject(HoldingsService);
  private readonly notification = inject(NotificationService);

  protected symbol = '';
  protected submitting = false;
  protected readonly today = new Date();

  private watchlistId = '';

  protected readonly form = this.fb.nonNullable.group({
    units: [0, [Validators.required, Validators.min(0.0001)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0.0001)]],
    purchaseDate: [new Date(), Validators.required],
  });

  ngOnInit(): void {
    this.watchlistId = this.route.snapshot.paramMap.get('watchlistId') ?? '';
    this.symbol = this.route.snapshot.queryParamMap.get('symbol') ?? '';
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.watchlistId || !this.symbol) return;

    const { units, pricePerUnit, purchaseDate } = this.form.getRawValue();
    const dateStr = purchaseDate instanceof Date
      ? purchaseDate.toISOString().split('T')[0]
      : purchaseDate;

    this.submitting = true;
    this.holdingsService.addHolding(this.watchlistId, {
      stockSymbol: this.symbol,
      units,
      pricePerUnit,
      purchaseDate: dateStr,
    }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.symbol} added to watchlist`);
        this.router.navigate(['/watchlists', this.watchlistId]);
      },
      error: (err) => {
        this.notification.showError(err.message ?? 'Failed to add holding');
        this.submitting = false;
      },
    });
  }

  protected goBack(): void {
    history.back();
  }
}
