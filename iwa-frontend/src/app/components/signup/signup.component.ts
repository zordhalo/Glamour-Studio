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
  hidePassword = true;
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
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNum: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
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
    // Mark all fields as touched to show validation errors
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;
      const formValue = this.signupForm.getRawValue();

      // Clean up the form values
      const signupData = {
        name: formValue.name.trim(),
        surname: formValue.surname.trim(),
        email: formValue.email.trim(),
        phoneNum: formValue.phoneNum.trim(),
        password: formValue.password
      };

      console.log('Attempting signup with email:', signupData.email);

      if (this.isOAuthSignup && this.oauthProvider === 'google') {
        const oauthToken = sessionStorage.getItem('oauthToken');
        if (!oauthToken) {
          this.showError('OAuth token not found. Please try again.');
          this.isSubmitting = false;
          return;
        }

        const googleUser = {
          accessToken: oauthToken,
          email: signupData.email,
          name: signupData.name,
          givenName: signupData.name,
          familyName: signupData.surname,
          phoneNum: signupData.phoneNum,
          id: ''
        };

        this.authService.signupWithGoogle(googleUser).subscribe({
          next: () => {
            // After successful signup, authenticate immediately
            this.authService.authenticateWithOAuth('google', oauthToken).subscribe({
              next: (loginResponse) => {
                this.isSubmitting = false;
                sessionStorage.removeItem('oauthToken');
                if (loginResponse.token) {
                  this.snackBar.open('Account created successfully! You are now logged in.', 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['success-snackbar']
                  });
                  this.router.navigate(['/dashboard']);
                } else {
                  this.showError('Account created but login failed. Please try logging in manually.');
                  this.router.navigate(['/login']);
                }
              },
              error: (loginErr) => {
                this.isSubmitting = false;
                sessionStorage.removeItem('oauthToken');
                console.error('OAuth authentication error after signup:', loginErr);
                this.showError('Account created but login failed. Please try logging in manually.');
                this.router.navigate(['/login']);
              }
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Google signup error:', err);
            if (err.status === 409 || err.error?.message?.includes('already registered')) {
              this.errorMessage = 'An account with this email already exists. Please login instead.';
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else {
              this.errorMessage = err.error?.message || 'OAuth signup failed. Please try again.';
            }
            this.showError(this.errorMessage ?? 'An unknown error occurred.');
          }
        });
      } else {
        this.authService.signup(signupData).pipe(take(1)).subscribe({
          next: (response) => {
            console.log('Signup successful:', response);
            this.handleSuccessfulSignup(signupData.email);
          },
          error: (err) => {
            console.error('Signup error:', err);
            this.isSubmitting = false;

            if (err.status === 409 || err.error?.message?.includes('already registered')) {
              this.errorMessage = 'An account with this email already exists. Please login instead.';
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else if (err.status === 400) {
              this.errorMessage = err.error?.message || 'Invalid signup data. Please check your information.';
            } else if (err.status === 0) {
              this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
            } else {
              this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
            }

            this.showError(this.errorMessage ?? 'An unknown error occurred.');
          }
        });
      }
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getNameErrorMessage(): string {
    const nameControl = this.signupForm.get('name');
    if (nameControl?.hasError('required')) {
      return 'First name is required';
    }
    if (nameControl?.hasError('minlength')) {
      return 'First name must be at least 2 characters';
    }
    return '';
  }

  getSurnameErrorMessage(): string {
    const surnameControl = this.signupForm.get('surname');
    if (surnameControl?.hasError('required')) {
      return 'Last name is required';
    }
    if (surnameControl?.hasError('minlength')) {
      return 'Last name must be at least 2 characters';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.signupForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPhoneErrorMessage(): string {
    const phoneControl = this.signupForm.get('phoneNum');
    if (phoneControl?.hasError('required')) {
      return 'Phone number is required';
    }
    if (phoneControl?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.signupForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  private handleSuccessfulSignup(email: string): void {
    this.isSubmitting = false;
    localStorage.setItem('pendingVerificationEmail', email);
    this.snackBar.open('Signup successful! Please check your email for the verification code.', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/verify-email'], {
      state: { email: email }
    });
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
              this.router.navigate(['/dashboard']);
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
