import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/permission.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canMatch: [permissionGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/users-page/users-page')
        .then(m => m.UsersPage),
  },
];
