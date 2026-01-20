import { Routes } from '@angular/router';
import { PublicLayout } from './core/layout/public-layout/public-layout';
import { AdminLayout } from './core/layout/admin-layout/admin-layout';
import { authGuard } from './core/auth/auth.guard';
// import { permissionGuard } from './core/auth/permission.guard'; // ใช้ Day ถัดไป

export const routes: Routes = [
  // default
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // ===== Public Zone =====
  {
    path: 'login',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page')
            .then((m) => m.LoginPageComponent),
      },
    ],
  },

  // ===== Admin Zone (Protected) =====
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],   // ⭐ Day 2: กันเข้าทั้ง admin
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
            .then((m) => m.DASHBOARD_ROUTES),
      },

      // 🔒 ตัวอย่าง route สำหรับ Day 4–5 (users)
      // {
      //   path: 'users',
      //   canMatch: [permissionGuard],
      //   data: { roles: ['admin'] },
      //   loadChildren: () =>
      //     import('./features/users/users.routes')
      //       .then((m) => m.USERS_ROUTES),
      // },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'login' },
];
