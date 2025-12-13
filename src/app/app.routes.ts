import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'scoreboard',
    pathMatch: 'full',
  },
  {
    path: 'scoreboard',
    loadComponent: () => import('./scoreboard/scoreboard').then((m) => m.Scoreboard),
  },
];
