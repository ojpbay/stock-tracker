import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DecimalPipe, DatePipe } from '@angular/common';
import { StocksStore } from '../store/stocks.store';
import { PriceBadgeComponent } from '../../../shared/components/price-badge/price-badge.component';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DecimalPipe,
    DatePipe,
    PriceBadgeComponent,
  ],
  providers: [StocksStore],
  templateUrl: './stock-detail.component.html',
  styles: [`
    .detail-container {
      max-width: 700px;
      margin: 0 auto;
    }

    .back-btn {
      color: var(--text-secondary) !important;
      font-size: 0.8rem !important;
      letter-spacing: 0.03em !important;
      margin-bottom: 1.25rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      margin: 4rem 0;
    }

    .error-card {
      margin-bottom: 1rem;
      background: var(--negative-dim) !important;
      border: 1px solid var(--negative-border) !important;
      border-radius: var(--radius-lg) !important;
    }

    /* Quote Card */
    .quote-card {
      background: var(--bg-card) !important;
      border: 1px solid var(--border-subtle) !important;
      border-radius: var(--radius-xl) !important;
      overflow: hidden;
      padding: 0 !important;
    }

    .quote-card-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid var(--border-subtle);
      background: linear-gradient(135deg, rgba(0,212,255,0.04) 0%, transparent 60%);
    }

    .company-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .quote-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .meta-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .meta-pill.symbol {
      background: var(--accent-dim);
      border: 1px solid var(--border-accent);
      color: var(--accent);
      font-family: 'Inter', monospace;
    }

    .meta-pill.exchange {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-secondary);
    }

    .meta-pill.currency {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-secondary);
    }

    /* Price section */
    .price-section {
      padding: 24px 28px;
      border-bottom: 1px solid var(--border-subtle);
    }

    /* Metrics grid */
    .metrics-section {
      padding: 20px 28px;
    }

    .metrics-title {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 16px;
      background: var(--bg-card);
    }

    .metric-label {
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .metric-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    /* Actions */
    .card-actions {
      padding: 16px 28px 24px;
    }

    .add-btn {
      background: linear-gradient(135deg, var(--accent), #0099CC) !important;
      color: #000 !important;
      font-weight: 700 !important;
      letter-spacing: 0.03em !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 0 20px var(--accent-glow) !important;
      padding: 0 24px !important;
      height: 42px !important;
    }
  `],
})
export class StockDetailComponent implements OnInit {
  protected readonly store = inject(StocksStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const symbol = this.route.snapshot.paramMap.get('symbol');
    if (symbol) {
      this.store.loadQuote(symbol);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/stocks']);
  }

  protected addToWatchlist(symbol: string): void {
    // User selects a watchlist, then navigates to add-holding
    this.router.navigate(['/watchlists'], { queryParams: { addSymbol: symbol } });
  }

  protected formatMarketCap(value: number): string {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toFixed(0);
  }
}
