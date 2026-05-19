import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID } from '@angular/core';

export function roleGuard(requiredRole: 'profesor' | 'admin'): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    const user = authService.getCurrentUser();

    if (!authService.hasSession() || !user) {
      router.navigateByUrl('/login');
      return false;
    }

    if (user.rol !== requiredRole) {
      // Redirect to the appropriate dashboard based on actual role
      const redirectPath = user.rol === 'admin' ? '/admin/dashboard' : '/app/dashboard';
      router.navigateByUrl(redirectPath);
      return false;
    }
    return true;
  };
}
