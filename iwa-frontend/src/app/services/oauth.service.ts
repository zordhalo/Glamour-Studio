import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private googleClientId = '';
  private googleInitialized = false;
  private googleAuthSubject = new Subject<any>();

  constructor() {}

  initializeGoogleAuth(clientId: string): Promise<void> {
    this.googleClientId = clientId;

    return new Promise((resolve, reject) => {
      if (this.googleInitialized) {
        resolve();
        return;
      }

      // Load the Google Identity Services library
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeGoogleClient();
        this.googleInitialized = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.body.appendChild(script);
    });
  }

  private initializeGoogleClient(): void {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    // Initialize the Google Identity Services client
    window.google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: this.handleGoogleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  private handleGoogleCredentialResponse(response: any): void {
    this.googleAuthSubject.next(response);
  }

  renderGoogleButton(buttonEl: HTMLElement, options?: any): void {
    if (!window.google) {
      console.error('Google Identity Services not initialized');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      width: buttonEl.offsetWidth || 400,
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left'
    };

    window.google.accounts.id.renderButton(buttonEl, {
      ...defaultOptions,
      ...options
    });
  }

  getGoogleAuthResponse(): Observable<any> {
    return this.googleAuthSubject.asObservable();
  }

  // Parse JWT token to get user info
  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  }

  // Alternative OAuth2 Authorization Code Flow (if needed)
  initiateOAuth2CodeFlow(): void {
    const params = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: window.location.origin + '/auth/callback',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
