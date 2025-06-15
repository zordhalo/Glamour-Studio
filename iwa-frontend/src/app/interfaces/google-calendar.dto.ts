export interface GoogleCalendarTokenDto {
  accessToken: string;
}

export interface GoogleCalendarSyncStatusDto {
  isSynced: boolean;
  calendarId?: string;
  lastSyncTime?: string;
  syncEnabled: boolean;
}

export interface CalendarEventDto {
  appointmentId: number;
  calendarEventId: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  lastSyncTime?: string;
}

export interface SyncResponseDto {
  success: boolean;
  message?: string;
  calendarEventId?: string;
  syncedCount?: number;
  failedCount?: number;
}
