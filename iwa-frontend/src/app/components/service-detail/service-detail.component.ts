import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ServiceResponseDto } from '../../interfaces/service.dto';
import { AvailabilitySlotResponseDto } from '../../interfaces/availability.dto';
import { BookAppointmentDto } from '../../interfaces/appointment.dto';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service: ServiceResponseDto | null = null;
  availableSlots: AvailabilitySlotResponseDto[] = [];
  isLoggedIn$: Observable<boolean>;

  today = new Date().toISOString();
  farFuture = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();


  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.apiService.get<ServiceResponseDto>(`services/${serviceId}`).subscribe(data => {
        this.service = data;
      });

      // Construct a query string for getAvailableSlots
      const queryString = `serviceId=${serviceId}&startTime=${this.today}&endTime=${this.farFuture}`;
      this.apiService.get<AvailabilitySlotResponseDto[]>(`availability?${queryString}`).subscribe(slots => {
        this.availableSlots = slots;
      });
    }
  }

  bookAppointment(slot: AvailabilitySlotResponseDto): void {
    if (!this.service) return;

    // A simple prompt for location, in a future app this would be a more robust form/dialog
    const location = prompt("Please enter the location for the appointment:", "My Home Address");
    if (!location) {
      this.snackBar.open('Location is required to book an appointment.', 'Close', { duration: 3000 });
      return;
    }

    const bookingData: BookAppointmentDto = {
      slotId: slot.slotId,
      serviceId: this.service.serviceId,
      location: location,
      description: 'Booked via frontend'
    };

    this.apiService.post('appointments', bookingData).subscribe({
      next: () => {
        this.snackBar.open('Appointment booked successfully!', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/my-appointments']);
      },
      error: (err) => {
        this.snackBar.open('Failed to book appointment. The slot may no longer be available.', 'Close', {
          duration: 3000,
        });
        console.error(err);
        // Refresh slots
        this.ngOnInit();
      }
    });
  }
}
