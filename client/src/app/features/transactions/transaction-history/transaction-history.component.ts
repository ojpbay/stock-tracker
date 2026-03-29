import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TransactionsStore } from '../store/transactions.store';

const COLUMNS = ['typeIcon', 'date', 'units', 'price', 'amount'];

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DecimalPipe,
  ],
  providers: [TransactionsStore],
  templateUrl: './transaction-history.component.html',
  styles: [`
    .history-container {
      max-width: 760px;
      margin: 0 auto;
    }

    .history-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left .page-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 4px;
    }

    .header-left h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-btn {
      color: var(--text-secondary) !important;
      font-size: 0.8rem !important;
    }

    .add-btn {
      background: linear-gradient(135deg, var(--accent), #0099CC) !important;
      color: #000 !important;
      font-weight: 700 !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 0 16px var(--accent-glow) !important;
      height: 38px !important;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      margin: 3rem 0;
    }

    .error-message {
      color: var(--negative);
      background: var(--negative-dim);
      border: 1px solid var(--negative-border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .full-width { width: 100%; }

    /* Transaction type icons */
    .type-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .type-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .type-icon-wrap.buy {
      background: rgba(255, 183, 0, 0.12);
      border: 1px solid rgba(255, 183, 0, 0.25);
    }

    .type-icon-wrap.sell {
      background: rgba(240, 82, 82, 0.12);
      border: 1px solid rgba(240, 82, 82, 0.25);
    }

    .type-icon-wrap.dividend {
      background: rgba(0, 212, 255, 0.12);
      border: 1px solid rgba(0, 212, 255, 0.25);
    }

    .type-icon-wrap mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .type-icon-wrap.buy mat-icon  { color: var(--positive); }
    .type-icon-wrap.sell mat-icon { color: var(--negative); }
    .type-icon-wrap.dividend mat-icon { color: var(--accent); }

    .type-label {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .type-label.buy      { color: var(--positive); }
    .type-label.sell     { color: var(--negative); }
    .type-label.dividend { color: var(--accent); }

    .num-cell {
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
      color: var(--text-secondary);
    }

    .date-cell {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .amount-positive { color: var(--positive); font-weight: 600; font-variant-numeric: tabular-nums; }
    .amount-neutral  { color: var(--text-primary); font-variant-numeric: tabular-nums; }
  `],
})
export class TransactionHistoryComponent implements OnInit {
  protected readonly store = inject(TransactionsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly columns = COLUMNS;

  private watchlistId = '';
  private holdingId = '';

  ngOnInit(): void {
    this.watchlistId = this.route.snapshot.paramMap.get('watchlistId') ?? '';
    this.holdingId = this.route.snapshot.paramMap.get('holdingId') ?? '';

    if (this.watchlistId && this.holdingId) {
      this.store.loadTransactions({ watchlistId: this.watchlistId, holdingId: this.holdingId });
    }
  }

  protected addTransaction(): void {
    this.router.navigate([
      '/transactions', this.watchlistId, this.holdingId, 'add',
    ]);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard', this.watchlistId]);
  }
}
