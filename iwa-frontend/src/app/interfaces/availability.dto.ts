export interface AvailabilitySlotResponseDto {
  slotId: number;
  serviceId: number;
  serviceName: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}
