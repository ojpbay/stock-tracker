import { Routes } from '@angular/router';

export const TRIVIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chat/trivia-chat.component').then((m) => m.TriviaChatComponent),
  },
];
