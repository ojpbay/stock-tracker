import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: ':watchlistId/:holdingId',
    loadComponent: () =>
      import('./transaction-history/transaction-history.component').then(
        (m) => m.TransactionHistoryComponent,
      ),
  },
  {
    path: ':watchlistId/:holdingId/add',
    loadComponent: () =>
      import('./add-transaction/add-transaction.component').then(
        (m) => m.AddTransactionComponent,
      ),
  },
];
