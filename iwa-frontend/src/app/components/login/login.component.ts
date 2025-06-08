import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OAuthService } from '../../services/oauth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;
  isGoogleLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Initialize Google OAuth
    this.oauthService.initializeGoogleAuth(environment.googleClientId).catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });

    // Subscribe to Google auth responses
    this.oauthService.getGoogleAuthResponse().subscribe({
      next: (response) => {
        this.handleGoogleLogin(response);
      },
      error: (error) => {
        console.error('Google auth error:', error);
        this.showError('Google authentication failed');
      }
    });
  }

  ngAfterViewInit(): void {
    // Render the Google button after the view is initialized
    setTimeout(() => {
      if (this.googleButton) {
        this.oauthService.renderGoogleButton(this.googleButton.nativeElement);
      }
    }, 100);
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;

      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/my-appointments']),
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Login failed. Please check your credentials.';
          console.error(err);
        }
      });
    }
  }

  private handleGoogleLogin(response: any): void {
    if (!response.credential) {
      this.showError('No credential received from Google');
      return;
    }

    this.isGoogleLoading = true;

    // Parse the JWT token to get user info
    const userInfo = this.oauthService.parseJwt(response.credential);

    if (!userInfo) {
      this.showError('Failed to parse Google response');
      this.isGoogleLoading = false;
      return;
    }

    // Note: Google One Tap returns an ID token, not an access token
    // The backend might need to be adjusted to handle ID tokens
    // For now, we'll send the credential as the access token
    this.authService.authenticateWithOAuth('google', response.credential).subscribe({
      next: (loginResponse) => {
        this.isGoogleLoading = false;
        if (loginResponse.token) {
          this.router.navigate(['/my-appointments']);
        } else {
          // User not found, redirect to signup
          this.router.navigate(['/signup'], {
            queryParams: {
              oauth: 'google',
              token: response.credential,
              email: userInfo.email,
              name: userInfo.name
            }
          });
        }
      },
      error: (err) => {
        this.isGoogleLoading = false;
        if (err.status === 404) {
          // User not found, redirect to signup with Google info
          this.router.navigate(['/signup'], {
            queryParams: {
              oauth: 'google',
              token: response.credential,
              email: userInfo.email,
              name: userInfo.name
            }
          });
        } else {
          this.showError('Google authentication failed');
        }
      }
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
