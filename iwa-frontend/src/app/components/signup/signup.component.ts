import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OAuthService } from '../../services/oauth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Subscription, take } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  signupForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;
  isGoogleLoading = false;
  isOAuthSignup = false;
  oauthProvider: string | null = null;
  private googleSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNum: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // Check if coming from OAuth login
    this.route.queryParams.subscribe(params => {
      if (params['oauth']) {
        this.isOAuthSignup = true;
        this.oauthProvider = params['oauth'];

        if (params['email']) {
          this.signupForm.patchValue({
            email: params['email'],
            name: params['name'] || ''
          });
          this.signupForm.get('email')?.disable();
        }

        if (params['token']) {
          sessionStorage.setItem('oauthToken', params['token']);
        }

        this.signupForm.get('password')?.clearValidators();
        this.signupForm.get('password')?.updateValueAndValidity();
      }
    });

    // Subscribe to Google auth responses
    this.googleSub = this.oauthService.getGoogleAuthResponse().subscribe({
      next: (response) => this.handleGoogleSignup(response),
      error: (error) => {
        console.error('Google auth error:', error);
        this.showError('Google authentication failed');
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isOAuthSignup) {
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
  }

  ngOnDestroy(): void {
    if (this.googleSub) {
      this.googleSub.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;
      const formValue = this.signupForm.getRawValue();

      if (this.isOAuthSignup && this.oauthProvider === 'google') {
        const oauthToken = sessionStorage.getItem('oauthToken');
        if (!oauthToken) {
          this.showError('OAuth token not found. Please try again.');
          this.isSubmitting = false;
          return;
        }

        const googleUser = {
          accessToken: oauthToken,
          email: formValue.email,
          name: formValue.name,
          givenName: formValue.name,
          familyName: formValue.surname,
          id: ''
        };

        this.authService.signupWithGoogle(googleUser).subscribe({
          next: () => {
            sessionStorage.removeItem('oauthToken');
            this.handleSuccessfulSignup(formValue.email, true);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = 'OAuth signup failed. Please try again.';
            console.error(err);
          }
        });
      } else {
        this.authService.signup(formValue).pipe(take(1)).subscribe({
          next: () => {
            this.handleSuccessfulSignup(formValue.email);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = 'Signup failed. The email might already be in use.';
            console.error(err);
          }
        });
      }
    }
  }

  private handleSuccessfulSignup(email: string, isGoogle: boolean = false): void {
    if (isGoogle) {
      // This case is for when the user was redirected from login to complete their profile
      const token = sessionStorage.getItem('oauthToken');
      if (token) {
        this.authService.authenticateWithOAuth('google', token).subscribe({
          next: () => {
            this.snackBar.open('Profile completed! You are now logged in.', 'Close', { duration: 5000 });
            this.router.navigate(['/my-appointments']);
          },
          error: () => this.router.navigate(['/login'])
        });
      }
    } else {
      localStorage.setItem('pendingVerificationEmail', email);
      this.snackBar.open('Signup successful! Please check your email for the verification code.', 'Close', {
        duration: 5000,
      });
      this.router.navigate(['/verify-email'], {
        state: { email: email }
      });
    }
  }

  private handleGoogleSignup(response: any): void {
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

    const googleUser = {
      accessToken: response.credential,
      email: userInfo.email,
      name: userInfo.name,
      givenName: userInfo.given_name || '',
      familyName: userInfo.family_name || '',
      id: userInfo.sub
    };

    this.authService.signupWithGoogle(googleUser).subscribe({
      next: () => {
        this.authService.authenticateWithOAuth('google', googleUser.accessToken).subscribe({
          next: (loginResponse) => {
            this.isGoogleLoading = false;
            if(loginResponse.token) {
              this.snackBar.open('Account created successfully! You are now logged in.', 'Close', { duration: 5000 });
              this.router.navigate(['/my-appointments']);
            }
          },
          error: () => {
            this.isGoogleLoading = false;
            this.showError('Account created, but automatic login failed. Please try logging in manually.');
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isGoogleLoading = false;
        if (err.status === 409) {
          this.showError('An account with this email already exists. Please login instead.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.showError('Google signup failed. Please try again.');
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
