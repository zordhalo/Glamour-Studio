import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleCalendarService } from '../../services/google-calendar.service';

@Component({
  selector: 'app-oauth-callback',
  template: `
    <div class="callback-container">
      <mat-spinner></mat-spinner>
      <p>Processing Google Calendar authorization...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatSnackBarModule]
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private googleCalendarService: GoogleCalendarService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check if we're in the main window or popup
    if (window.opener && window.opener !== window) {
      // We're in a popup, just close it
      // The parent window will handle the token
      return;
    }

    // We're in the main window, extract the token from URL fragment
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');

      if (accessToken) {
        // Save the token and redirect to settings
        this.googleCalendarService.saveCalendarToken(accessToken).subscribe({
          next: () => {
            this.snackBar.open('Google Calendar connected successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/settings']);
          },
          error: (err) => {
            console.error('Failed to save calendar token', err);
            this.snackBar.open('Failed to connect Google Calendar. Please try again.', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/settings']);
          }
        });
      } else {
        // No token found, redirect to settings
        this.router.navigate(['/settings']);
      }
    } else {
      // No fragment found, redirect to settings
      this.router.navigate(['/settings']);
    }
  }
}
