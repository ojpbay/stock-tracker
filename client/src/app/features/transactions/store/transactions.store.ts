import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity } from '@ngrx/signals/entities';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TransactionsService, Transaction, AddTransactionRequest } from '../services/transactions.service';

export interface TransactionsState {
  loading: boolean;
  error: string | null;
  activeHoldingId: string | null;
  activeWatchlistId: string | null;
}

export const TransactionsStore = signalStore(
  withEntities<Transaction>(),
  withState<TransactionsState>({
    loading: false,
    error: null,
    activeHoldingId: null,
    activeWatchlistId: null,
  }),
  withComputed((store) => ({
    allTransactions: computed(() => store.entities()),
    transactionCount: computed(() => store.entities().length),
    buyTransactions: computed(() => store.entities().filter((t) => t.type === 'Buy')),
    sellTransactions: computed(() => store.entities().filter((t) => t.type === 'Sell')),
    dividendTransactions: computed(() => store.entities().filter((t) => t.type === 'Dividend')),
  })),
  withMethods((store, service = inject(TransactionsService)) => ({
    loadTransactions: rxMethod<{ watchlistId: string; holdingId: string }>(
      pipe(
        tap(({ holdingId, watchlistId }) =>
          patchState(store, {
            loading: true,
            error: null,
            activeHoldingId: holdingId,
            activeWatchlistId: watchlistId,
          }),
        ),
        switchMap(({ watchlistId, holdingId }) =>
          service.list(watchlistId, holdingId).pipe(
            tapResponse({
              next: (transactions) =>
                patchState(store, setAllEntities(transactions, { selectId: (t: Transaction) => t.transactionId }), {
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    addTransaction: rxMethod<AddTransactionRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((request) => {
          const watchlistId = store.activeWatchlistId()!;
          const holdingId = store.activeHoldingId()!;
          return service.add(watchlistId, holdingId, request).pipe(
            tapResponse({
              next: (result) =>
                patchState(store, addEntity(result as unknown as Transaction, { selectId: (t) => t.transactionId }), {
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          );
        }),
      ),
    ),
  })),
);
