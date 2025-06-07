export interface AppointmentResponseDto {
  appointmentId: number;
  userName: string;
  serviceName: string;
  status: string;
  location: string;
  scheduledAt: string; 
  description: string;
}

export interface BookAppointmentDto {
  slotId: number;
  serviceId: number;
  location: string;
  description?: string;
}
