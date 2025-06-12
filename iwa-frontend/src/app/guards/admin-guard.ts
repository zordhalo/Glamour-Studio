import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  authorities?: Array<{ authority: string }>;
}

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
        return false;
      }

      const token = authService.getToken();
      if (!token) {
        router.navigate(['/login']);
        return false;
      }

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const hasAdminRole = decoded.authorities?.some(
          (auth) => auth.authority === 'ROLE_ADMIN'
        );

        if (!hasAdminRole) {
          router.navigate(['/dashboard']);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error decoding token:', error);
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
