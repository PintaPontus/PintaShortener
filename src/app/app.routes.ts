import { Routes } from '@angular/router';
import { Redirect } from './redirect/redirect';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: ':id',
    component: Redirect,
  },
  { path: '**', redirectTo: '' },
];
