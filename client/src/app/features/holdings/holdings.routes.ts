import { Routes } from '@angular/router';

export const HOLDINGS_ROUTES: Routes = [
  {
    path: ':watchlistId/add',
    loadComponent: () =>
      import('./add-holding/add-holding.component').then((m) => m.AddHoldingComponent),
  },
];
