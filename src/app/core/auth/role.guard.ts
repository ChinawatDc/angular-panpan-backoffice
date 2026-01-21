import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from '../ui/toast/toast.service';

export const roleGuard = (role: string): CanActivateFn => (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  if (auth.roles().includes(role)) return true;

  toast.error('No permission');
  return router.createUrlTree(['/admin']);
};
