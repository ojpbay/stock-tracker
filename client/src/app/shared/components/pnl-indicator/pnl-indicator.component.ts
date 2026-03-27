import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pnl-indicator',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  template: `
    <span class="pnl-wrapper" [class]="cssClass()">
      <mat-icon class="pnl-icon">{{ icon() }}</mat-icon>
      <span class="pnl-value">{{ formattedValue() }}</span>
      @if (showPercent() && pnlPercent() !== null) {
        <span class="pnl-percent">({{ pnlPercent() | number:'1.2-2' }}%)</span>
      }
    </span>
  `,
  styles: [`
    .pnl-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    .pnl-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    .pnl-positive { color: #2e7d32; }
    .pnl-negative { color: #c62828; }
    .pnl-neutral  { color: #546e7a; }
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
