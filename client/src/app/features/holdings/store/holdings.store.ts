import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { WatchlistsService, HoldingSummary } from '../../watchlists/services/watchlists.service';

export const HoldingsStore = signalStore(
  withEntities<HoldingSummary>(),
  withState({ loading: false, error: null as string | null }),
  withComputed((store) => ({
    allHoldings: computed(() => store.entities()),
  })),
  withMethods((store, service = inject(WatchlistsService)) => ({
    loadHoldings: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((watchlistId) =>
          service.get(watchlistId).pipe(
            tapResponse({
              next: (wl) =>
                patchState(
                  store,
                  setAllEntities(wl.holdings, { selectId: (h: HoldingSummary) => h.holdingId }),
                  { loading: false },
                ),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    addHolding(holding: HoldingSummary): void {
      patchState(store, addEntity(holding, { selectId: (h: HoldingSummary) => h.holdingId }));
    },

    updateHolding(holding: HoldingSummary): void {
      patchState(store, updateEntity({ id: holding.holdingId, changes: holding }, { selectId: (h: HoldingSummary) => h.holdingId }));
    },
  })),
);
