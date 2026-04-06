import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-price-badge',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './price-badge.component.html',
  styleUrl: './price-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
