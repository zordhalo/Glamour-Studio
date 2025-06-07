import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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

  onSubmit(): void {
    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;

      this.authService.signup(this.signupForm.value).pipe(take(1)).subscribe({
        next: () => {
          // Store email temporarily for verification page
          localStorage.setItem('pendingVerificationEmail', this.signupForm.value.email);

          this.snackBar.open('Signup successful! Please check your email for the verification code.', 'Close', {
            duration: 5000,
          });

          // Navigate to verify-email page with email in state
          this.router.navigate(['/verify-email'], {
            state: { email: this.signupForm.value.email }
          });
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
