import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pnl-indicator',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './pnl-indicator.component.html',
  styleUrl: './pnl-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
