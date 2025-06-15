import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  constructor(private apiService: ApiService) {}

  debugSlotStatuses(): void {
    // Get all slots
    this.apiService.get<any[]>('availability/all').subscribe({
      next: (slots) => {
        console.group('🔍 Slot Status Debug');
        console.log(`Total slots: ${slots.length}`);
        
        const bookedSlots = slots.filter(s => s.isBooked);
        const availableSlots = slots.filter(s => !s.isBooked);
        
        console.log(`✅ Available slots: ${availableSlots.length}`);
        console.log(`🔒 Booked slots: ${bookedSlots.length}`);
        
        console.group('Booked Slots Details');
        bookedSlots.forEach(slot => {
          console.log(`Slot #${slot.slotId} - ${slot.serviceName}`);
          console.log(`  Time: ${new Date(slot.startTime).toLocaleString()}`);
          console.log(`  isBooked: ${slot.isBooked}`);
        });
        console.groupEnd();
        
        console.group('Available Slots Details');
        availableSlots.slice(0, 5).forEach(slot => {
          console.log(`Slot #${slot.slotId} - ${slot.serviceName}`);
          console.log(`  Time: ${new Date(slot.startTime).toLocaleString()}`);
          console.log(`  isBooked: ${slot.isBooked}`);
        });
        if (availableSlots.length > 5) {
          console.log(`... and ${availableSlots.length - 5} more available slots`);
        }
        console.groupEnd();
        
        console.groupEnd();
      },
      error: (error) => {
        console.error('❌ Error debugging slots:', error);
      }
    });

    // Get appointments to cross-reference
    this.apiService.get<any[]>('appointments').subscribe({
      next: (appointments) => {
        console.group('📅 Appointments Debug');
        console.log(`Total appointments: ${appointments.length}`);
        
        const activeAppointments = appointments.filter(a => 
          a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
        );
        
        console.log(`Active appointments: ${activeAppointments.length}`);
        console.groupEnd();
      }
    });
  }
}
