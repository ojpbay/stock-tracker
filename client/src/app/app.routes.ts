import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'stocks',
    pathMatch: 'full',
  },
  {
    path: 'stocks',
    loadChildren: () =>
      import('./features/stocks/stocks.routes').then((m) => m.STOCKS_ROUTES),
  },
  {
    path: 'watchlists',
    loadChildren: () =>
      import('./features/watchlists/watchlists.routes').then((m) => m.WATCHLISTS_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'holdings',
    loadChildren: () =>
      import('./features/holdings/holdings.routes').then((m) => m.HOLDINGS_ROUTES),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES),
  },
  {
    path: 'trivia',
    loadChildren: () =>
      import('./features/trivia/trivia.routes').then((m) => m.TRIVIA_ROUTES),
  },
];
