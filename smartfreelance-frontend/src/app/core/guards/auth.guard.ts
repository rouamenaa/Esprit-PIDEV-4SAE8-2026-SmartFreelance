import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serviceslogin/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  console.log('🛡️ Auth Guard: Checking token for route:', state.url, 'Token exists:', !!token);

  if (token) {
    return true;
  }

  console.log('🛡️ Auth Guard: No token found, redirecting to login');
  router.navigate(['/login']);
  return false;
};