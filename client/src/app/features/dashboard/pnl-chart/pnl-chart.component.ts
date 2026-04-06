import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { HoldingDashboardRow } from '../services/dashboard.service';

@Component({
  selector: 'app-pnl-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './pnl-chart.component.html',
  styleUrl: './pnl-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PnlChartComponent {
  readonly holdings = input<HoldingDashboardRow[]>([]);

  protected readonly chartData = computed<ChartData<'bar'>>(() => {
    const rows = this.holdings();
    return {
      labels: rows.map((r) => r.stockSymbol),
      datasets: [
        {
          label: 'Unrealised P&L',
          data: rows.map((r) => r.unrealisedPnL ?? 0),
          backgroundColor: rows.map((r) =>
            (r.unrealisedPnL ?? 0) >= 0
              ? 'rgba(255, 183, 0, 0.75)'
              : 'rgba(240, 82, 82, 0.75)',
          ),
          borderColor: rows.map((r) =>
            (r.unrealisedPnL ?? 0) >= 0 ? '#FFB700' : '#F05252',
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  });

  protected readonly chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151E30',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#94A3B8',
        bodyColor: '#E2E8F0',
        padding: 10,
        callbacks: {
          label: (ctx) => ` P&L: ${ctx.raw as number >= 0 ? '+' : ''}$${(ctx.raw as number).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#4B5880', font: { family: 'Inter', size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#4B5880',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${Number(value) >= 0 ? '+' : ''}$${Number(value).toFixed(0)}`,
        },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };
}
