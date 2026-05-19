import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(requiredRole: 'profesor' | 'admin'): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/login');
      return false;
    }

    if (authService.userRole() !== requiredRole) {
      // Redirect to the appropriate dashboard based on actual role
      const redirectPath = authService.userRole() === 'admin' ? '/admin/dashboard' : '/app/dashboard';
      router.navigateByUrl(redirectPath);
      return false;
    }
    return true;
  };
}
