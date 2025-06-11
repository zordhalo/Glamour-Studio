import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AppointmentResponseDto } from '../../interfaces/appointment.dto';
import { RescheduleDialogComponent } from './reschedule-dialog/reschedule-dialog.component';
import { CancelConfirmDialogComponent } from './cancel-confirm-dialog/cancel-confirm-dialog.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  appointments = signal<AppointmentResponseDto[]>([]);
  isLoading = signal(true);
  selectedTab = signal(0);

  upcomingAppointments = computed(() =>
    this.appointments()
      .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  );

  pastAppointments = computed(() =>
    this.appointments()
      .filter(apt => apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  );

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadUserProfile(): void {
    this.apiService.get<UserProfileDto>('users/profile').subscribe({
      next: (data) => {
        this.userProfile.set(data);
        this.profileForm.patchValue({
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || '',
          phoneNum: data.phoneNum || ''
        });
      },
      error: (err) => {
        console.error('Failed to fetch user profile', err);
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

  loadAppointments(): void {
    this.isLoading.set(true);
    this.apiService.get<AppointmentResponseDto[]>('appointments/my').subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch appointments', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'SCHEDULED': 'event_available',
      'CONFIRMED': 'check_circle',
      'IN_PROGRESS': 'pending',
      'COMPLETED': 'task_alt',
      'CANCELLED': 'cancel',
      'NO_SHOW': 'event_busy'
    };
    return statusIcons[status] || 'help_outline';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getDaysUntil(date: string): number {
    const today = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canCancel(appointment: AppointmentResponseDto): boolean {
    return appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';
  }

  canReschedule(appointment: AppointmentResponseDto): boolean {
    return appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';
  }

  openRescheduleDialog(appointment: AppointmentResponseDto): void {
    const dialogRef = this.dialog.open(RescheduleDialogComponent, {
      width: '600px',
      data: { appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  openCancelDialog(appointment: AppointmentResponseDto): void {
    const dialogRef = this.dialog.open(CancelConfirmDialogComponent, {
      width: '400px',
      data: { appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelAppointment(appointment);
      }
    });
  }

  cancelAppointment(appointment: AppointmentResponseDto): void {
    this.apiService.put(`appointments/${appointment.appointmentId}/cancel`, {}).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Failed to cancel appointment', err);
      }
    });
  }

  bookNewAppointment(): void {
    this.router.navigate(['/services']);
  }

  viewServiceDetails(serviceId: number | undefined): void {
    if (serviceId) {
      this.router.navigate(['/services', serviceId]);
    }
  }
}
