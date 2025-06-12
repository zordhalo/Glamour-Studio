import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token might be expired or invalid
        const token = authService.getToken();
        if (token) {
          // Clear the token and redirect to login
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
