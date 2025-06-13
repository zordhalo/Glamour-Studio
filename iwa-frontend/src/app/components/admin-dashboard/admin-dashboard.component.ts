import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { AvailabilitySlotResponseDto } from '../../interfaces/availability.dto';

interface Appointment {
  appointmentId: number;
  userId: number;
  userName: string;
  serviceId: number;
  serviceName: string;
  serviceDescription: string;
  serviceDurationMin: number;
  servicePrice: number;
  status: string;
  location: string;
  scheduledAt: string;
  description: string;
}

interface Service {
  serviceId: number;
  name: string;
  description: string;
  minDuration: number;
  price: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  availabilitySlots: AvailabilitySlotResponseDto[] = [];
  services: Service[] = [];

  appointmentDisplayedColumns: string[] = [
    'appointmentId',
    'customer',
    'service',
    'dateTime',
    'status',
    'totalPrice',
    'actions'
  ];

  slotDisplayedColumns: string[] = [
    'slotId',
    'service',
    'date',
    'time',
    'status',
    'actions'
  ];

  newSlotForm: FormGroup;
  selectedServiceId: number | null = null;
  statusFilter: string = 'all';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.newSlotForm = this.fb.group({
      serviceId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadAvailabilitySlots();
    this.loadServices();
  }

  loadAppointments(): void {
    this.apiService.get<Appointment[]>('appointments').subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        console.log('Loaded appointments:', appointments);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Failed to load appointments', 'Close', { duration: 3000 });
      }
    });
  }

  loadAvailabilitySlots(): void {
    this.apiService.get<AvailabilitySlotResponseDto[]>('availability/all').subscribe({
      next: (slots) => {
        console.log('Raw slots response:', JSON.stringify(slots));

        // Sort slots: non-expired first (by date), then expired (by date)
        this.availabilitySlots = slots.sort((a, b) => {
          const aExpired = this.isSlotExpired(a);
          const bExpired = this.isSlotExpired(b);

          // If one is expired and the other isn't, non-expired comes first
          if (aExpired && !bExpired) return 1;
          if (!aExpired && bExpired) return -1;

          // Otherwise sort by date (newest first for non-expired, oldest first for expired)
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);

          if (!aExpired && !bExpired) {
            // For non-expired: newest first
            return dateB.getTime() - dateA.getTime();
          } else {
            // For expired: oldest first (so recently expired are at top of expired section)
            return dateA.getTime() - dateB.getTime();
          }
        });

        console.log('Loaded availability slots:', slots);
        // Let's log the isBooked values to debug
        slots.forEach(slot => {
          console.log(`Slot ${slot.slotId}: isBooked = ${slot.isBooked}, type = ${typeof slot.isBooked}`);
        });
      },
      error: (error) => {
        console.error('Error loading availability slots:', error);
        this.snackBar.open('Failed to load availability slots', 'Close', { duration: 3000 });
      }
    });
  }

  loadServices(): void {
    this.apiService.get<Service[]>('services').subscribe({
      next: (services) => {
        this.services = services;
        console.log('Loaded services:', services);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.snackBar.open('Failed to load services', 'Close', { duration: 3000 });
      }
    });
  }

  getFilteredAppointments(): Appointment[] {
    if (this.statusFilter === 'all') {
      return this.appointments;
    }
    return this.appointments.filter(app => app.status === this.statusFilter);
  }

  cancelAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Appointment',
        message: `Are you sure you want to cancel appointment #${appointment.appointmentId} for ${appointment.userName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.put(`appointments/${appointment.appointmentId}/cancel`, {})
          .subscribe({
            next: () => {
              this.snackBar.open('Appointment cancelled successfully', 'Close', { duration: 3000 });
              this.loadAppointments();
            },
            error: (error) => {
              console.error('Error cancelling appointment:', error);
              this.snackBar.open('Failed to cancel appointment', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }

  updateAppointmentStatus(appointment: Appointment, newStatus: string): void {
    this.apiService.put(`appointments/${appointment.appointmentId}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          this.snackBar.open(`Appointment status updated to ${newStatus}`, 'Close', { duration: 3000 });
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);
          this.snackBar.open('Failed to update appointment status', 'Close', { duration: 3000 });
        }
      });
  }

  createAvailabilitySlot(): void {
    if (this.newSlotForm.valid) {
      const formValue = this.newSlotForm.value;
      const date = this.formatDate(formValue.date);
      const slotData = {
        serviceId: formValue.serviceId,
        startTime: `${date}T${formValue.startTime}:00`,
        endTime: `${date}T${formValue.endTime}:00`
      };

      this.apiService.post('availability', slotData).subscribe({
        next: () => {
          this.snackBar.open('Availability slot created successfully', 'Close', { duration: 3000 });
          this.newSlotForm.reset();
          this.loadAvailabilitySlots();
        },
        error: (error) => {
          console.error('Error creating availability slot:', error);
          this.snackBar.open('Failed to create availability slot', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteAvailabilitySlot(slot: AvailabilitySlotResponseDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Availability Slot',
        message: `Are you sure you want to delete this availability slot?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.delete(`availability/${slot.slotId}`).subscribe({
          next: () => {
            this.snackBar.open('Availability slot deleted successfully', 'Close', { duration: 3000 });
            this.loadAvailabilitySlots();
          },
          error: (error) => {
            console.error('Error deleting availability slot:', error);
            this.snackBar.open('Failed to delete availability slot', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleSlotAvailability(slot: AvailabilitySlotResponseDto): void {
    if (this.isSlotExpired(slot)) {
      this.snackBar.open('Cannot modify expired slots', 'Close', { duration: 3000 });
      return;
    }

    const action = slot.isBooked ? 'release' : 'book';
    const confirmMessage = slot.isBooked ?
      'Are you sure you want to release this booked slot? This will make it available for booking again.' :
      'Are you sure you want to manually mark this slot as booked?';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: slot.isBooked ? 'Release Booking' : 'Mark as Booked',
        message: confirmMessage
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const endpoint = `availability/${slot.slotId}/${action}`;

        this.apiService.put(endpoint, {}).subscribe({
          next: () => {
            const message = slot.isBooked ?
              'Booking released successfully - slot is now available' :
              'Slot marked as booked';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            this.loadAvailabilitySlots();
            this.loadAppointments(); // Reload appointments in case this affects them
          },
          error: (error) => {
            console.error('Error updating slot availability:', error);
            this.snackBar.open('Failed to update slot availability', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'CONFIRMED': return 'primary';
      case 'CANCELLED': return 'accent';
      case 'COMPLETED': return 'primary';
      default: return '';
    }
  }

  // Helper methods to extract date and time from ISO string
  getDateFromDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString();
  }

  getTimeFromDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getTimeRangeFromSlot(slot: AvailabilitySlotResponseDto): string {
    const startTime = this.getTimeFromDateTime(slot.startTime);
    const endTime = this.getTimeFromDateTime(slot.endTime);
    return `${startTime} - ${endTime}`;
  }

  // Check if a slot is expired (past the current date/time)
  isSlotExpired(slot: AvailabilitySlotResponseDto): boolean {
    if (!slot || !slot.endTime) return false;
    return new Date(slot.endTime) < new Date();
  }

  // Get slot status display
  getSlotStatus(slot: AvailabilitySlotResponseDto): string {
    if (this.isSlotExpired(slot)) {
      return 'Expired';
    }
    return slot.isBooked ? 'Booked' : 'Available';
  }

  // Get CSS class for slot status
  getSlotStatusClass(slot: AvailabilitySlotResponseDto): string {
    if (this.isSlotExpired(slot)) {
      return 'expired';
    }
    return slot.isBooked ? 'booked' : 'available';
  }

  // Check if slot actions should be disabled
  shouldDisableSlotActions(slot: AvailabilitySlotResponseDto): boolean {
    return this.isSlotExpired(slot);
  }
}
