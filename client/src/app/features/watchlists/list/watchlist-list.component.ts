import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchlistsStore } from '../store/watchlists.store';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  providers: [WatchlistsStore],
  templateUrl: './watchlist-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .list-container {
      max-width: 760px;
      margin: 0 auto;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
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
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }

    .new-btn {
      background: linear-gradient(135deg, var(--accent), #0099CC) !important;
      color: #000 !important;
      font-weight: 700 !important;
      letter-spacing: 0.02em !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 0 16px var(--accent-glow) !important;
      height: 40px !important;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      margin: 3rem 0;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .empty-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
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

    .watchlist-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .watchlist-card {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
      gap: 16px;
    }

    .watchlist-card:hover {
      background: var(--bg-hover);
      border-color: var(--border-default);
      transform: translateY(-1px);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--accent-dim);
      border: 1px solid var(--border-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon mat-icon {
      color: var(--accent);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .card-body {
      flex: 1;
      min-width: 0;
    }

    .card-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .holdings-badge {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted);
    }

    .card-description {
      font-size: 0.78rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 320px;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .edit-btn {
      color: var(--text-muted) !important;
      width: 32px !important;
      height: 32px !important;
    }

    .edit-btn:hover {
      color: var(--accent) !important;
      background: var(--accent-dim) !important;
    }

    .chevron {
      color: var(--text-muted);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
})
export class WatchlistListComponent implements OnInit {
  protected readonly store = inject(WatchlistsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly addSymbol = signal<string | null>(null);

  ngOnInit(): void {
    const symbol = this.route.snapshot.queryParamMap.get('addSymbol');
    if (symbol) {
      this.addSymbol.set(symbol);
    }
    this.store.loadWatchlists();
  }

  protected createNew(): void {
    this.router.navigate(['/watchlists', 'new']);
  }

  protected navigateToWatchlist(id: string): void {
    const symbol = this.addSymbol();
    if (symbol) {
      this.router.navigate(['/holdings', id, 'add'], { queryParams: { symbol } });
    } else {
      this.router.navigate(['/dashboard', id]);
    }
  }

  protected navigateToEdit(event: Event, id: string): void {
    event.stopPropagation();
    this.router.navigate(['/watchlists', id]);
  }
}
