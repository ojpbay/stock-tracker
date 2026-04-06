import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { StocksStore } from '../store/stocks.store';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [StocksStore],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSearchComponent implements OnInit {
  protected readonly store = inject(StocksStore);
  private readonly router = inject(Router);

  protected readonly searchControl = new FormControl('');

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((value): value is string => !!value && value.length >= 1),
    ).subscribe((query) => {
      this.store.searchStocks(query);
    });

    this.searchControl.valueChanges.pipe(
      filter((value) => !value),
    ).subscribe(() => {
      this.store.clearResults();
    });
  }

  protected navigateToDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
