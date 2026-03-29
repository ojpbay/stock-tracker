import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { WatchlistsStore } from '../store/watchlists.store';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  providers: [WatchlistsStore],
  templateUrl: './watchlist-list.component.html',
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
