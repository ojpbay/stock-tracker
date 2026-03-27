import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { DashboardService, DashboardData } from '../services/dashboard.service';

export interface DashboardState {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  dashboardData: null,
  loading: false,
  error: null,
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    holdings: computed(() => store.dashboardData()?.holdings ?? []),
    summary: computed(() => store.dashboardData()?.summary ?? null),
    watchlistName: computed(() => store.dashboardData()?.watchlistName ?? ''),
    hasData: computed(() => store.dashboardData() !== null),
  })),
  withMethods((store, service = inject(DashboardService)) => ({
    loadDashboard: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((watchlistId) =>
          service.getDashboard(watchlistId).pipe(
            tapResponse({
              next: (dashboardData) => patchState(store, { dashboardData, loading: false }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    clearDashboard(): void {
      patchState(store, { dashboardData: null, error: null });
    },
  })),
);
