import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OAuthService } from '../../services/oauth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

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
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;
  isGoogleLoading = false;
  hidePassword = true;
  private googleSub!: Subscription;

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
    // Subscribe to Google auth responses
    this.googleSub = this.oauthService.getGoogleAuthResponse().subscribe({
      next: (response) => this.handleGoogleLogin(response),
      error: (error) => {
        console.error('Google auth error:', error);
        this.showError('Google authentication failed');
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    // Wait for the Google Auth service to be initialized, then render the button.
    try {
      await this.oauthService.initializeGoogleAuth(environment.googleClientId);
      if (this.googleButton) {
        this.oauthService.renderGoogleButton(this.googleButton.nativeElement);
      }
    } catch (error) {
      console.error('Failed to initialize or render Google Button:', error);
      this.showError('Could not load Google Sign-In.');
    }
  }

  ngOnDestroy(): void {
    if (this.googleSub) {
      this.googleSub.unsubscribe();
    }
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;

      const credentials = {
        email: this.loginForm.get('email')?.value.trim(),
        password: this.loginForm.get('password')?.value
      };

      console.log('Attempting login with email:', credentials.email);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.isSubmitting = false;

          if (err.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (err.status === 403) {
            this.errorMessage = 'Account not verified. Please check your email for verification code.';
          } else if (err.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
          } else {
            this.errorMessage = err.error?.message || 'Login failed. Please try again.';
          }

          this.showError(this.errorMessage ?? 'An unknown error occurred.');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    return '';
  }

  private handleGoogleLogin(response: any): void {
    if (!response.credential) {
      this.showError('No credential received from Google');
      return;
    }

    this.isGoogleLoading = true;
    const userInfo = this.oauthService.parseJwt(response.credential);

    if (!userInfo) {
      this.showError('Failed to parse Google response');
      this.isGoogleLoading = false;
      return;
    }

    this.authService.authenticateWithOAuth('google', response.credential).subscribe({
      next: (loginResponse) => {
        this.isGoogleLoading = false;
        if (loginResponse.token) {
          this.router.navigate(['/dashboard']);
        } else {
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
