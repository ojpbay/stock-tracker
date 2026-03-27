import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { StocksService, StockSearchResult, StockQuote } from '../services/stocks.service';

export interface StocksState {
  results: StockSearchResult[];
  selectedQuote: StockQuote | null;
  loading: boolean;
  error: string | null;
}

const initialState: StocksState = {
  results: [],
  selectedQuote: null,
  loading: false,
  error: null,
};

export const StocksStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    hasResults: computed(() => store.results().length > 0),
    hasError: computed(() => store.error() !== null),
  })),
  withMethods((store, stocksService = inject(StocksService)) => ({
    searchStocks: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((query) =>
          stocksService.search(query).pipe(
            tapResponse({
              next: (results) => patchState(store, { results, loading: false }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    loadQuote: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((symbol) =>
          stocksService.getQuote(symbol).pipe(
            tapResponse({
              next: (selectedQuote) =>
                patchState(store, { selectedQuote, loading: false }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    clearResults(): void {
      patchState(store, { results: [], selectedQuote: null, error: null });
    },
  })),
);
