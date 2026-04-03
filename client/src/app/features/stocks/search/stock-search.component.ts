import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { StocksStore } from '../store/stocks.store';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [StocksStore],
  templateUrl: './stock-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .search-container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0;
    }

    .search-header {
      margin-bottom: 2rem;
    }

    .page-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .search-box-wrap {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-field {
      width: 100%;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      margin: 1.5rem 0;
    }

    .error-message {
      color: var(--negative);
      font-size: 0.875rem;
      padding: 10px 14px;
      background: var(--negative-dim);
      border: 1px solid var(--negative-border);
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
    }

    .no-results {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding: 2.5rem 1rem;
    }

    .results-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 0 0 8px;
      margin-bottom: 4px;
    }

    .results-list {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      padding: 4px 0 !important;
    }

    .result-item {
      cursor: pointer;
      transition: background 0.15s ease;
      border-bottom: 1px solid var(--border-subtle);
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-item:hover {
      background: var(--bg-hover) !important;
    }

    .symbol-badge {
      font-family: 'Inter', monospace;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      background: var(--accent-dim);
      border: 1px solid var(--border-accent);
      color: var(--accent);
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 2px;
    }

    .chevron-icon {
      color: var(--text-muted);
      font-size: 18px;
    }
  `],
})
export class StockSearchComponent implements OnInit {
  protected readonly store = inject(StocksStore);
  private readonly router = inject(Router);

  protected readonly searchControl = new FormControl('');

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((value): value is string => !!value && value.length >= 1),
    ).subscribe((query) => {
      this.store.searchStocks(query);
    });

    this.searchControl.valueChanges.pipe(
      filter((value) => !value),
    ).subscribe(() => {
      this.store.clearResults();
    });
  }

  protected navigateToDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
