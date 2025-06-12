import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UserProfileDto, UserProfileUpdateDto } from '../../interfaces/user.dto';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  profileForm: FormGroup;
  isUpdatingProfile = signal(false);
  isLoading = signal(true);
  userProfile = signal<UserProfileDto | null>(null);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      phoneNum: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.apiService.get<UserProfileDto>('users/profile').subscribe({
      next: (data) => {
        this.userProfile.set(data);
        this.profileForm.patchValue({
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || '',
          phoneNum: data.phoneNum || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch user profile', err);
        this.isLoading.set(false);

        if (err.status === 401) {
          this.snackBar.open('Session expired. Please log in again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          // Use AuthService to logout properly
          this.authService.logout();
        } else {
          this.snackBar.open('Failed to load profile data', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.profileForm.dirty) {
      this.isUpdatingProfile.set(true);
      const updateData: UserProfileUpdateDto = {
        name: this.profileForm.get('name')?.value,
        surname: this.profileForm.get('surname')?.value,
        phoneNum: this.profileForm.get('phoneNum')?.value
      };

      this.apiService.put<UserProfileDto>('users/profile', updateData).subscribe({
        next: (data) => {
          this.userProfile.set(data);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.profileForm.markAsPristine();
          this.isUpdatingProfile.set(false);
        },
        error: (err) => {
          this.snackBar.open('Failed to update profile. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.isUpdatingProfile.set(false);
        }
      });
    }
  }

  resetForm(): void {
    const profile = this.userProfile();
    if (profile) {
      this.profileForm.patchValue({
        name: profile.name || '',
        surname: profile.surname || '',
        email: profile.email || '',
        phoneNum: profile.phoneNum || ''
      });
      this.profileForm.markAsPristine();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
