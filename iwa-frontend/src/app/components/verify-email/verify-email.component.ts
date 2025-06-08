import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-verify-email',
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  canResend = true;
  resendTimer = 0;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    // Get email from navigation state or localStorage
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['email']) {
      this.email = navigation.extras.state['email'];
    } else {
      // Try to get from localStorage (temporary storage during verification process)
      this.email = localStorage.getItem('pendingVerificationEmail') || '';
    }

    if (!this.email) {
      // If no email found, redirect to signup
      this.router.navigate(['/signup']);
    }
  }

  onSubmit(): void {
    if (this.verifyForm.valid && this.email) {
      this.isLoading = true;
      this.errorMessage = null;

      const verificationData = {
        email: this.email,
        verificationCode: this.verifyForm.value.code
      };

      this.authService.verifyEmail(verificationData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Email verified successfully!';
          localStorage.removeItem('pendingVerificationEmail');

          this.snackBar.open('Email verified! You can now log in.', 'Close', {
            duration: 5000,
          });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid verification code. Please try again.';
          console.error(err);
        }
      });
    }
  }

  resendCode(): void {
    if (!this.canResend || !this.email) return;

    this.canResend = false;
    this.resendTimer = 60;

    const timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(timerInterval);
      }
    }, 1000);

    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.snackBar.open('Verification code sent! Check your email.', 'Close', {
          duration: 5000,
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to resend code. Please try again.';
        console.error(err);
        this.canResend = true;
        this.resendTimer = 0;
        clearInterval(timerInterval);
      }
    });
  }

  // Format the input to accept only numbers and clear placeholder behavior
  onCodeInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      this.verifyForm.patchValue({ code: value });
      // Clear the placeholder effect by ensuring the input shows the actual value
      event.target.value = value;
    }
  }
}
