import { Routes } from '@angular/router';

export const WATCHLISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/watchlist-list.component').then((m) => m.WatchlistListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./edit/watchlist-edit.component').then((m) => m.WatchlistEditComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./edit/watchlist-edit.component').then((m) => m.WatchlistEditComponent),
  },
];
