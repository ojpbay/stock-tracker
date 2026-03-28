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
  templateUrl: './dashboard.component.html',
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
