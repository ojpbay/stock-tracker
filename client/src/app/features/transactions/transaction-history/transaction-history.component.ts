import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  styleUrl: './transaction-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
