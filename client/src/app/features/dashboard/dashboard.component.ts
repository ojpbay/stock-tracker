import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PnlIndicatorComponent } from '../../shared/components/pnl-indicator/pnl-indicator.component';
import { AddHoldingDialogComponent } from '../holdings/add-holding/add-holding-dialog.component';
import { PnlChartComponent } from './pnl-chart/pnl-chart.component';
import { DashboardStore } from './store/dashboard.store';

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
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly columns = COLUMNS;
  protected readonly watchlistId = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('watchlistId');
    if (id) {
      this.watchlistId.set(id);
      this.store.loadDashboard(id);
    }
  }

  protected openAddHoldingDialog(): void {
    this.dialog.open(AddHoldingDialogComponent, {
      data: { watchlistId: this.watchlistId() },
      width: '540px',
      disableClose: false,
    });
  }
}
