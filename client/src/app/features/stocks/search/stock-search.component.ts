import { Component, OnInit, inject } from '@angular/core';
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
  template: `
    <div class="search-container">
      <h1>Stock Search</h1>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search by company name or ticker symbol</mat-label>
        <input matInput [formControl]="searchControl" placeholder="e.g. Apple or AAPL" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      @if (store.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
        </div>
      }

      @if (store.error()) {
        <p class="error-message">{{ store.error() }}</p>
      }

      @if (store.hasResults() && !store.loading()) {
        <mat-nav-list>
          @for (result of store.results(); track result.symbol) {
            <mat-list-item (click)="navigateToDetail(result.symbol)">
              <span matListItemTitle>{{ result.symbol }}</span>
              <span matListItemLine>{{ result.companyName }} &bull; {{ result.exchange }}</span>
              <mat-icon matListItemMeta>chevron_right</mat-icon>
            </mat-list-item>
          }
        </mat-nav-list>
      }

      @if (!store.loading() && !store.hasResults() && searchControl.value) {
        <p class="no-results">No results found for "{{ searchControl.value }}"</p>
      }
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 640px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .search-field {
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      margin: 1rem 0;
    }
    .error-message {
      color: var(--mat-sys-error);
    }
    .no-results {
      color: var(--mat-sys-on-surface-variant);
    }
    mat-list-item {
      cursor: pointer;
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
