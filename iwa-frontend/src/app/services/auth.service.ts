import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, take, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from './api.service';
import { LoginResponseDto } from '../interfaces/auth.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private pendingRequests = new Map<string, Observable<any>>();

  constructor(private apiService: ApiService, private router: Router) {}

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  login(credentials: any): Observable<LoginResponseDto> {
    return this.apiService.post<LoginResponseDto>('auth/login', credentials).pipe(
      tap((response) => {
        localStorage.setItem('jwt_token', response.token);
        this.loggedIn.next(true);
      })
    );
  }

  signup(userInfo: any): Observable<any> {
    const key = 'signup_' + userInfo.email;

    // Check if there's already a pending request for this email
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request and store it
    const request$ = this.apiService.post('auth/signup', userInfo).pipe(
      tap(() => {
        // Remove from pending requests when complete
        this.pendingRequests.delete(key);
      }),
      take(1)
    );

    this.pendingRequests.set(key, request$);
    return request$;
  }

  signupWithGoogle(googleUser: any): Observable<any> {
    return this.apiService.post('auth/signup/google', googleUser);
  }

  signupWithFacebook(facebookUser: any): Observable<any> {
    return this.apiService.post('auth/signup/facebook', facebookUser);
  }

  authenticateWithOAuth(provider: string, accessToken: string): Observable<LoginResponseDto> {
    return this.apiService.post<LoginResponseDto>('auth/oauth/authenticate', {
      provider,
      accessToken
    }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  verifyEmail(verificationData: { email: string; verificationCode: string }): Observable<any> {
    return this.apiService.postText('auth/verify', verificationData);
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.apiService.postText(`auth/resend?email=${encodeURIComponent(email)}`, {});
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const isExpired = Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        // Clear expired token
        localStorage.removeItem('jwt_token');
        return false;
      }
      return true;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('jwt_token');
      return false;
    }
  }
}
