import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-price-badge',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './price-badge.component.html',
  styles: [`
    .price-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .current-price {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .price-change {
      font-size: 0.85rem;
    }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
    .neutral  { color: #546e7a; }
  `]
})
export class PriceBadgeComponent {
  readonly price = input.required<number>();
  readonly priceChange = input(0);
  readonly priceChangePercent = input(0);
  readonly currency = input('$');

  readonly changeClass = computed(() =>
    this.priceChange() > 0 ? 'positive' : this.priceChange() < 0 ? 'negative' : 'neutral'
  );
}
