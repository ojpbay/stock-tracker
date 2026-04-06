import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  styleUrl: './stock-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
