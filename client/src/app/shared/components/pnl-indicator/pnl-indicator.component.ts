import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pnl-indicator',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './pnl-indicator.component.html',
  styles: [`
    .pnl-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      font-variant-numeric: tabular-nums;
    }
    .pnl-icon {
      font-size: 17px;
      height: 17px;
      width: 17px;
    }
    .pnl-value {
      font-size: 0.9rem;
      letter-spacing: -0.01em;
    }
    .pnl-percent {
      font-size: 0.78rem;
      opacity: 0.85;
    }
    .pnl-positive { color: #FFB700; }
    .pnl-negative { color: #F05252; }
    .pnl-neutral  { color: #94A3B8; }
  `]
})
export class PnlIndicatorComponent {
  readonly pnl = input.required<number>();
  readonly pnlPercent = input<number | null>(null);
  readonly currency = input('$');
  readonly showPercent = input(true);

  readonly cssClass = computed(() =>
    this.pnl() > 0 ? 'pnl-positive' : this.pnl() < 0 ? 'pnl-negative' : 'pnl-neutral'
  );

  readonly icon = computed(() =>
    this.pnl() > 0 ? 'trending_up' : this.pnl() < 0 ? 'trending_down' : 'trending_flat'
  );

  readonly formattedValue = computed(() => {
    const abs = Math.abs(this.pnl());
    const sign = this.pnl() >= 0 ? '+' : '-';
    return `${sign}${this.currency()}${abs.toFixed(2)}`;
  });
}
