import { Routes } from '@angular/router';
import { Record } from './record/record';
import { Redirect } from './redirect/redirect';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'record',
    pathMatch: 'full',
  },
  {
    path: 'record',
    component: Record,
  },
  {
    path: 'go/:id',
    component: Redirect,
  },
  { path: '**', redirectTo: 'record' },
];
