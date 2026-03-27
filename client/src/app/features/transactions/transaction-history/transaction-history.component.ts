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
  template: `
    <div class="history-container">
      <div class="header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
        <h1>Transaction History</h1>
        <button mat-raised-button color="primary" (click)="addTransaction()">
          <mat-icon>add</mat-icon>
          Add
        </button>
      </div>

      @if (store.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
        </div>
      }

      @if (store.error()) {
        <p class="error-message">{{ store.error() }}</p>
      }

      @if (!store.loading() && store.allTransactions().length === 0) {
        <p class="empty-state">No transactions recorded yet.</p>
      }

      @if (store.allTransactions().length > 0) {
        <table mat-table [dataSource]="store.allTransactions()" class="full-width">
          <ng-container matColumnDef="typeIcon">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let row">
              <mat-icon [class]="row.type.toLowerCase()">
                {{ row.type === 'Buy' ? 'trending_up' : row.type === 'Sell' ? 'trending_down' : 'attach_money' }}
              </mat-icon>
              {{ row.type }}
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let row">{{ row.transactionDate }}</td>
          </ng-container>

          <ng-container matColumnDef="units">
            <th mat-header-cell *matHeaderCellDef>Units</th>
            <td mat-cell *matCellDef="let row">
              {{ row.units !== null ? (row.units | number: '1.0-4') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let row">
              {{ row.pricePerUnit !== null ? (row.pricePerUnit | number: '1.2-2') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let row">
              @if (row.dividendAmount !== null) {
                <span class="dividend">+{{ row.dividendAmount | number: '1.2-2' }}</span>
              } @else if (row.units !== null && row.pricePerUnit !== null) {
                {{ row.units * row.pricePerUnit | number: '1.2-2' }}
              } @else {
                —
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 720px;
      margin: 1rem auto;
      padding: 0 1rem;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    h1 { flex: 1; }
    .loading-container { display: flex; justify-content: center; margin: 2rem; }
    .full-width { width: 100%; }
    .empty-state { text-align: center; color: var(--mat-sys-on-surface-variant); }
    .error-message { color: var(--mat-sys-error); }
    .buy { color: #2e7d32; }
    .sell { color: #c62828; }
    .dividend { color: #1565c0; }
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
