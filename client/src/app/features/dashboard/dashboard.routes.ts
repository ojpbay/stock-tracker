import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: ':watchlistId',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
