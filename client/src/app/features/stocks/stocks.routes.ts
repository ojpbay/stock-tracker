import { Routes } from '@angular/router';

export const STOCKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./search/stock-search.component').then((m) => m.StockSearchComponent),
  },
  {
    path: ':symbol',
    loadComponent: () =>
      import('./detail/stock-detail.component').then((m) => m.StockDetailComponent),
  },
];
