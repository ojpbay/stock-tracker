import { Component, OnInit, inject, signal } from '@angular/core';
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
import { HoldingRowComponent } from './holding-row/holding-row.component';
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
    HoldingRowComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
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

    .back-btn {
      color: var(--text-secondary) !important;
      font-size: 0.8rem !important;
    }

    /* Loading */
    .loading-container {
      display: flex;
      justify-content: center;
      margin: 4rem 0;
    }

    /* Error */
    .error-card {
      background: var(--negative-dim) !important;
      border: 1px solid var(--negative-border) !important;
      border-radius: var(--radius-lg) !important;
      margin-bottom: 1rem;
    }

    /* Summary stats row */
    .summary-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 1.25rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.15s ease;
    }

    .stat-card:hover {
      border-color: var(--border-default);
    }

    .stat-card.accent-card {
      border-color: var(--border-accent);
      background: linear-gradient(135deg, rgba(0,212,255,0.05) 0%, var(--bg-card) 100%);
    }

    .stat-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    /* Chart card */
    .chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      margin-bottom: 1.25rem;
    }

    .section-title {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    /* Holdings table card */
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .add-holding-btn {
      background: var(--accent-dim) !important;
      color: var(--accent) !important;
      border: 1px solid var(--border-accent) !important;
      font-weight: 600 !important;
      font-size: 0.8rem !important;
      border-radius: var(--radius-md) !important;
      height: 34px !important;
    }

    .holdings-table {
      width: 100%;
    }

    .symbol-cell strong {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: 'Inter', monospace;
    }

    .symbol-cell small {
      display: block;
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .num-cell {
      font-variant-numeric: tabular-nums;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stale-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--positive);
      vertical-align: middle;
      margin-left: 3px;
    }

    .unavailable {
      color: var(--text-muted);
      font-style: italic;
      font-size: 0.8rem;
    }

    .row-action-btn {
      color: var(--text-muted) !important;
      width: 28px !important;
      height: 28px !important;
      font-size: 14px !important;
    }

    .row-action-btn:hover {
      color: var(--accent) !important;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .empty-sub {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
  `],
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = COLUMNS;
  protected readonly watchlistId = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('watchlistId');
    if (id) {
      this.watchlistId.set(id);
      this.store.loadDashboard(id);
    }
  }
}
