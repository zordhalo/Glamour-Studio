# Google Calendar Sync Feature

This document describes the Google Calendar sync functionality implemented in the IWA Beauty Salon frontend application.

## Overview

The Google Calendar sync feature allows users to automatically sync their beauty appointments with their Google Calendar. This ensures they never miss an appointment and receive timely reminders.

## Features

### User Features
- **One-click Google Calendar connection** - Users can connect their Google Calendar from the settings page
- **Automatic appointment sync** - New appointments are automatically added to Google Calendar
- **Individual appointment sync** - Users can sync specific appointments from the dashboard
- **Sync status indicators** - Visual indicators show which appointments are synced
- **Disconnect option** - Users can disconnect Google Calendar at any time

### Technical Features
- OAuth 2.0 authentication flow with Google
- Secure token handling
- Real-time sync status updates
- Error handling and retry mechanisms
- Responsive UI with loading states

## Implementation Details

### Frontend Components

#### 1. Google Calendar Service (`google-calendar.service.ts`)
- Handles OAuth 2.0 authentication flow
- Manages API calls to backend for sync operations
- Creates calendar events from appointment data
- Provides sync status information

#### 2. User Settings Component
- Added Google Calendar integration section
- Toggle switch to enable/disable sync
- Shows current sync status
- "Sync All Appointments" button for bulk sync

#### 3. User Dashboard Component
- Added "Add to Calendar" button for individual appointments
- Shows sync status badges for synced appointments
- "Connect Calendar" button in header if not connected

#### 4. OAuth Callback Component
- Handles OAuth redirect after Google authorization
- Extracts access token from URL
- Saves token to backend

### User Flow

1. **Initial Connection**
   - User navigates to Settings page
   - Clicks "Enable Sync" toggle
   - Google OAuth popup opens
   - User authorizes calendar access
   - Token is saved and sync is enabled

2. **Syncing Appointments**
   - Automatic: New appointments sync automatically if enabled
   - Manual: User can click "Add to Calendar" on individual appointments
   - Bulk: User can sync all appointments from settings

3. **Managing Sync**
   - View sync status in settings
   - See which appointments are synced (green badge)
   - Disable sync anytime from settings

## Configuration

### Environment Variables
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  googleRedirectUri: 'http://localhost:4200/settings',
  googleCalendarScope: 'https://www.googleapis.com/auth/calendar.events'
};
```

### Google Cloud Console Setup
1. Create a new project or select existing
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:4200/settings` (development)
   - `https://your-domain.com/settings` (production)
5. Add authorized JavaScript origins:
   - `http://localhost:4200` (development)
   - `https://your-domain.com` (production)

## Backend Requirements

The backend needs to implement the following endpoints:

### 1. Save Google Calendar Token
```
POST /api/users/google-calendar/token
Body: { accessToken: string }
```

### 2. Get Sync Status
```
GET /api/users/google-calendar/status
Response: {
  isSynced: boolean,
  calendarId?: string,
  lastSyncTime?: string,
  syncEnabled: boolean
}
```

### 3. Disable Calendar Sync
```
DELETE /api/users/google-calendar/sync
```

### 4. Sync Single Appointment
```
POST /api/appointments/{appointmentId}/sync-to-calendar
Response: {
  success: boolean,
  calendarEventId: string
}
```

### 5. Sync All Appointments
```
POST /api/appointments/sync-all-to-calendar
Response: {
  success: boolean,
  syncedCount: number,
  failedCount: number
}
```

## Security Considerations

1. **Token Storage**: Access tokens should be securely stored in the backend
2. **Token Refresh**: Implement token refresh mechanism for expired tokens
3. **Scope Limitation**: Only request calendar.events scope
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure proper CORS settings for Google APIs

## UI/UX Guidelines

1. **Loading States**: Show spinners during sync operations
2. **Error Messages**: Clear error messages with retry options
3. **Success Feedback**: Toast notifications for successful sync
4. **Visual Indicators**: Clear badges/icons for sync status
5. **Responsive Design**: Works on all screen sizes

## Testing

### Manual Testing Checklist
- [ ] Connect Google Calendar from settings
- [ ] Sync individual appointment
- [ ] Sync all appointments
- [ ] Disconnect Google Calendar
- [ ] Verify sync status indicators
- [ ] Test error scenarios (network failure, invalid token)
- [ ] Test on mobile devices

### Automated Testing
- Unit tests for GoogleCalendarService
- Component tests for sync UI elements
- E2E tests for complete sync flow

## Future Enhancements

1. **Two-way Sync**: Update appointments when changed in Google Calendar
2. **Calendar Selection**: Allow users to choose which calendar to sync to
3. **Custom Reminders**: Let users set custom reminder preferences
4. **Conflict Detection**: Warn about calendar conflicts
5. **Bulk Operations**: Select multiple appointments to sync
6. **Sync History**: Show sync history and logs

## Troubleshooting

### Common Issues

1. **"Authorization cancelled" error**
   - User closed the popup without authorizing
   - Solution: Try connecting again

2. **"Failed to sync appointment" error**
   - Token might be expired
   - Network issue
   - Solution: Reconnect Google Calendar

3. **Sync badge not appearing**
   - Backend might not be returning calendarEventId
   - Check browser console for errors

4. **Settings page redirect not working**
   - Check redirect URI configuration in Google Console
   - Ensure environment variables are correct

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend endpoints are implemented
3. Ensure Google Cloud Console is configured correctly
4. Check network tab for API responses
