import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WatchlistsStore } from '../store/watchlists.store';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  providers: [WatchlistsStore],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h1>My Watchlists</h1>
        <button mat-raised-button color="primary" (click)="createNew()">
          <mat-icon>add</mat-icon>
          New Watchlist
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

      @if (store.isEmpty() && !store.loading()) {
        <p class="empty-state">No watchlists yet. Create one to get started.</p>
      }

      @if (!store.isEmpty()) {
        <mat-nav-list>
          @for (watchlist of store.watchlists(); track watchlist.id) {
            <mat-list-item (click)="navigateToWatchlist(watchlist.id)">
              <span matListItemTitle>{{ watchlist.name }}</span>
              <span matListItemLine>
                {{ watchlist.holdingCount }} holding{{ watchlist.holdingCount !== 1 ? 's' : '' }}
                @if (watchlist.description) {
                  &bull; {{ watchlist.description }}
                }
              </span>
              <mat-icon matListItemMeta>chevron_right</mat-icon>
            </mat-list-item>
          }
        </mat-nav-list>
      }
    </div>
  `,
  styles: [`
    .list-container {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    .empty-state, .error-message {
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-list-item { cursor: pointer; }
  `],
})
export class WatchlistListComponent implements OnInit {
  protected readonly store = inject(WatchlistsStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadWatchlists();
  }

  protected createNew(): void {
    this.router.navigate(['/watchlists', 'new']);
  }

  protected navigateToWatchlist(id: string): void {
    this.router.navigate(['/watchlists', id]);
  }
}
