import { Component, Inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AvailabilitySlotResponseDto } from '../../../interfaces/availability.dto';

interface DialogData {
  appointment: any;
}

@Component({
  selector: 'app-reschedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  templateUrl: './reschedule-dialog.component.html',
  styleUrls: ['./reschedule-dialog.component.scss']
})
export class RescheduleDialogComponent implements OnInit {
  rescheduleForm: FormGroup;
  isLoading = signal(false);
  availableSlots = signal<AvailabilitySlotResponseDto[]>([]);
  selectedDate = signal<Date | null>(null);
  minDate = new Date();
  maxDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<RescheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    // Set date range (next 30 days)
    this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.rescheduleForm = this.fb.group({
      date: [null, Validators.required],
      slotId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Set initial date to current appointment date
    const currentDate = new Date(this.data.appointment.scheduledAt);
    this.rescheduleForm.patchValue({ date: currentDate });
    this.selectedDate.set(currentDate);
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
      this.loadAvailableSlots(date);
    }
  }

  loadAvailableSlots(date: Date): void {
    this.isLoading.set(true);
    const dateStr = date.toISOString().split('T')[0];

    this.apiService.get<AvailabilitySlotResponseDto[]>(`availability/slots/date/${dateStr}`).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load slots', err);
        this.isLoading.set(false);
      }
    });
  }

  formatTime(slot: AvailabilitySlotResponseDto): string {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    return `${startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }

  onSubmit(): void {
    if (this.rescheduleForm.valid) {
      this.isLoading.set(true);
      const rescheduleData = {
        newSlotId: this.rescheduleForm.value.slotId,
        serviceId: this.data.appointment.serviceId
      };

      this.apiService.put(
        `appointments/${this.data.appointment.appointmentId}/reschedule`,
        rescheduleData
      ).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to reschedule', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    // Disable Sundays (0) for example - you can customize this
    return day !== 0;
  };

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
