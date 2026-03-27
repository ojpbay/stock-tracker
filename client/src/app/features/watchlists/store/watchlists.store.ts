import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { WatchlistsService, WatchlistSummary, WatchlistDetail, CreateWatchlistRequest } from '../services/watchlists.service';

export interface WatchlistsState {
  watchlists: WatchlistSummary[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WatchlistsState = {
  watchlists: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const WatchlistsStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    selectedWatchlist: computed(() =>
      store.watchlists().find((w) => w.id === store.selectedId()) ?? null,
    ),
    isEmpty: computed(() => store.watchlists().length === 0),
  })),
  withMethods((store, service = inject(WatchlistsService)) => ({
    loadWatchlists: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.list().pipe(
            tapResponse({
              next: (watchlists) => patchState(store, { watchlists, loading: false }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    createWatchlist: rxMethod<CreateWatchlistRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((request) =>
          service.create(request).pipe(
            tapResponse({
              next: (created) =>
                patchState(store, {
                  watchlists: [...store.watchlists(), created],
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    updateWatchlist: rxMethod<{ id: string } & CreateWatchlistRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, ...request }) =>
          service.update(id, request).pipe(
            tapResponse({
              next: (updated) =>
                patchState(store, {
                  watchlists: store
                    .watchlists()
                    .map((w) => (w.id === updated.id ? updated : w)),
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    deleteWatchlist: rxMethod<string>(
      pipe(
        switchMap((id) =>
          service.delete(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, {
                  watchlists: store.watchlists().filter((w) => w.id !== id),
                  selectedId: store.selectedId() === id ? null : store.selectedId(),
                }),
              error: (err: Error) => patchState(store, { error: err.message }),
            }),
          ),
        ),
      ),
    ),

    selectWatchlist(id: string): void {
      patchState(store, { selectedId: id });
    },
  })),
);
