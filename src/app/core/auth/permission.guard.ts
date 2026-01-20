import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const permissionGuard: CanMatchFn = (route: Route): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  if (auth.hasAnyRole(required)) return true;

  return router.createUrlTree(['/admin']); // หรือทำหน้า 403 แยกวันหลัง
};
