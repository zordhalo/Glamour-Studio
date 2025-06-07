import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AppointmentResponseDto } from '../../interfaces/appointment.dto';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatChipsModule],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss']
})
export class MyAppointmentsComponent implements OnInit {
  appointments: AppointmentResponseDto[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.get<AppointmentResponseDto[]>('appointments/my').subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch appointments', err);
        this.isLoading = false;
      }
    });
  }
}
