import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';
import { DashboardStore } from './store/dashboard.store';
import { PnlIndicatorComponent } from '../../shared/components/pnl-indicator/pnl-indicator.component';
import { PnlChartComponent } from './pnl-chart/pnl-chart.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const COLUMNS = ['symbol', 'units', 'avgPrice', 'currentPrice', 'currentValue', 'pnl'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DecimalPipe,
    RouterLink,
    PnlIndicatorComponent,
    PnlChartComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <button mat-button routerLink="/watchlists">
          <mat-icon>arrow_back</mat-icon>
          Watchlists
        </button>
        <h1>{{ store.watchlistName() }}</h1>
      </div>

      @if (store.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48" />
        </div>
      }

      @if (store.error()) {
        <mat-card class="error-card">
          <mat-card-content>{{ store.error() }}</mat-card-content>
        </mat-card>
      }

      @if (store.hasData() && !store.loading()) {
        <!-- Summary card -->
        @if (store.summary(); as summary) {
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Portfolio Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Total Cost</span>
                  <span class="value">{{ summary.totalCost | number: '1.2-2' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Current Value</span>
                  <span class="value">{{ (summary.totalCurrentValue ?? 0) | number: '1.2-2' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Overall P&L</span>
                  <app-pnl-indicator
                    [pnl]="summary.totalUnrealisedPnL ?? 0"
                    [pnlPercent]="summary.totalUnrealisedPnLPercent ?? 0"
                    [showPercent]="true"
                  />
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- P&L chart -->
        @if (store.holdings().length > 0) {
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>P&L by Holding</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-pnl-chart [holdings]="store.holdings()" />
            </mat-card-content>
          </mat-card>
        }

        <!-- Holdings table -->
        @if (store.holdings().length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Holdings</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="store.holdings()" class="full-width">
                <ng-container matColumnDef="symbol">
                  <th mat-header-cell *matHeaderCellDef>Symbol</th>
                  <td mat-cell *matCellDef="let row">
                    <strong>{{ row.stockSymbol }}</strong>
                    <br />
                    <small>{{ row.companyName }}</small>
                  </td>
                </ng-container>

                <ng-container matColumnDef="units">
                  <th mat-header-cell *matHeaderCellDef>Units</th>
                  <td mat-cell *matCellDef="let row">{{ row.totalUnits | number: '1.0-4' }}</td>
                </ng-container>

                <ng-container matColumnDef="avgPrice">
                  <th mat-header-cell *matHeaderCellDef>Avg. Price</th>
                  <td mat-cell *matCellDef="let row">{{ row.averagePurchasePrice | number: '1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="currentPrice">
                  <th mat-header-cell *matHeaderCellDef>Current Price</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.currentPrice !== null) {
                      {{ row.currentPrice | number: '1.2-2' }}
                      @if (row.priceIsStale) {
                        <mat-icon class="stale-icon" matTooltip="Price may be outdated">warning</mat-icon>
                      }
                    } @else {
                      <span class="unavailable">Unavailable</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="currentValue">
                  <th mat-header-cell *matHeaderCellDef>Value</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.currentValue !== null ? (row.currentValue | number: '1.2-2') : '—' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="pnl">
                  <th mat-header-cell *matHeaderCellDef>P&L</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.unrealisedPnL !== null) {
                      <app-pnl-indicator
                        [pnl]="row.unrealisedPnL"
                        [pnlPercent]="row.unrealisedPnLPercent ?? 0"
                        [showPercent]="true"
                      />
                    } @else {
                      <span>—</span>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        } @else {
          <p class="empty-state">No holdings in this watchlist yet.</p>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 960px;
      margin: 1rem auto;
      padding: 0 1rem;
    }
    .dashboard-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      margin: 3rem 0;
    }
    .summary-card, .chart-card {
      margin-bottom: 1rem;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .value {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .full-width { width: 100%; }
    .stale-icon {
      font-size: 1rem;
      color: orange;
      vertical-align: middle;
    }
    .unavailable {
      color: var(--mat-sys-on-surface-variant);
      font-style: italic;
    }
    .empty-state {
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
      padding: 2rem;
    }
    .error-card {
      background-color: var(--mat-sys-error-container);
      margin-bottom: 1rem;
    }
  `],
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = COLUMNS;

  ngOnInit(): void {
    const watchlistId = this.route.snapshot.paramMap.get('watchlistId');
    if (watchlistId) {
      this.store.loadDashboard(watchlistId);
    }
  }
}
