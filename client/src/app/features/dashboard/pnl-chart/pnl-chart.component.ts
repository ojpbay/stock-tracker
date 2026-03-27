import { Component, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { HoldingDashboardRow } from '../services/dashboard.service';

@Component({
  selector: 'app-pnl-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas baseChart
        [data]="chartData()"
        [options]="chartOptions"
        type="bar"
      ></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 220px;
    }
  `],
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
            (r.unrealisedPnL ?? 0) >= 0 ? '#2e7d32' : '#c62828',
          ),
          borderColor: rows.map((r) =>
            (r.unrealisedPnL ?? 0) >= 0 ? '#1b5e20' : '#b71c1c',
          ),
          borderWidth: 1,
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
        callbacks: {
          label: (ctx) => `P&L: ${ctx.raw as number >= 0 ? '+' : ''}${(ctx.raw as number).toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(0)}`,
        },
      },
    },
  };
}
