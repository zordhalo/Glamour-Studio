import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppointmentResponseDto } from '../interfaces/appointment.dto';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    gapi: any;
  }
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarSyncStatus {
  isSynced: boolean;
  calendarId?: string;
  lastSyncTime?: string;
  syncEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private gapiLoaded = false;
  private googleAuth: any;
  private accessToken: string | null = null;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // Initialize Google API client library
  async initializeGapi(): Promise<void> {
    if (this.gapiLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          this.gapiLoaded = true;
          resolve();
        });
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.body.appendChild(script);
    });
  }

  // Request Google Calendar authorization
  async requestCalendarAuthorization(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.initializeGapi();

        const params = {
          client_id: environment.googleClientId,
          scope: environment.googleCalendarScope,
          response_type: 'token',
          prompt: 'consent',
          access_type: 'online'
        };

        // Use Google's OAuth2 authorization endpoint
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
          Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&') +
          `&redirect_uri=${encodeURIComponent(environment.googleRedirectUri)}`;

        // Open popup for authorization
        const authWindow = window.open(authUrl, 'google-auth', 'width=500,height=600');

        // Listen for the authorization response
        const checkInterval = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(checkInterval);
              reject(new Error('Authorization cancelled'));
              return;
            }

            // Check if we received the token in the URL
            const url = authWindow?.location.href;
            if (url && url.includes('access_token=')) {
              const token = this.extractTokenFromUrl(url);
              if (token) {
                clearInterval(checkInterval);
                authWindow.close();
                this.accessToken = token;
                resolve(token);
              }
            }
          } catch (e) {
            // Cross-origin error is expected until redirect happens
          }
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private extractTokenFromUrl(url: string): string | null {
    const match = url.match(/access_token=([^&]+)/);
    return match ? match[1] : null;
  }

  // Save the access token to backend
  saveCalendarToken(accessToken: string): Observable<any> {
    return this.apiService.post('users/google-calendar/token', { accessToken });
  }

  // Get sync status from backend
  getSyncStatus(): Observable<GoogleCalendarSyncStatus> {
    return this.apiService.get<GoogleCalendarSyncStatus>('users/google-calendar/status');
  }

  // Enable calendar sync
  enableSync(): Observable<any> {
    return from(this.requestCalendarAuthorization()).pipe(
      switchMap(token => this.saveCalendarToken(token)),
      catchError(error => {
        console.error('Failed to enable calendar sync:', error);
        return throwError(() => error);
      })
    );
  }

  // Disable calendar sync
  disableSync(): Observable<any> {
    return this.apiService.delete('users/google-calendar/sync');
  }

  // Sync a specific appointment to Google Calendar
  syncAppointment(appointmentId: number): Observable<any> {
    return this.apiService.post(`appointments/${appointmentId}/sync-to-calendar`, {});
  }

  // Sync all appointments
  syncAllAppointments(): Observable<any> {
    return this.apiService.post('appointments/sync-all-to-calendar', {});
  }

  // Create calendar event from appointment
  private createEventFromAppointment(appointment: AppointmentResponseDto): CalendarEvent {
    const startDate = new Date(appointment.scheduledAt);
    const endDate = new Date(startDate.getTime() + (appointment.serviceDurationMin || 60) * 60000);

    return {
      summary: `${appointment.serviceName} - Beauty Appointment`,
      description: appointment.serviceDescription || '',
      location: appointment.location || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 } // 1 hour before
        ]
      }
    };
  }

  // Create a calendar event directly (if we have access token)
  createCalendarEvent(appointment: AppointmentResponseDto): Observable<any> {
    if (!this.accessToken) {
      return throwError(() => new Error('No access token available'));
    }

    const event = this.createEventFromAppointment(appointment);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      event,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Failed to create calendar event:', error);
        return throwError(() => error);
      })
    );
  }

  // Update a calendar event
  updateCalendarEvent(eventId: string, appointment: AppointmentResponseDto): Observable<any> {
    if (!this.accessToken) {
      return throwError(() => new Error('No access token available'));
    }

    const event = this.createEventFromAppointment(appointment);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      event,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Failed to update calendar event:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete a calendar event
  deleteCalendarEvent(eventId: string): Observable<any> {
    if (!this.accessToken) {
      return throwError(() => new Error('No access token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`
    });

    return this.http.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Failed to delete calendar event:', error);
        return throwError(() => error);
      })
    );
  }
}
