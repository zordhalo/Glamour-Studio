import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface AccountNotFoundDialogData {
  email: string;
  name?: string;
}

@Component({
  selector: 'app-account-not-found-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">info</mat-icon>
      Account Not Found
    </h2>
    <mat-dialog-content>
      <p>We couldn't find an account associated with <strong>{{ data.email }}</strong>.</p>
      <p>Would you like to create a new account?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onCreateAccount()">Create Account</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    mat-dialog-content {
      padding: 20px 24px;
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 24px 24px 0;
    }
    
    p {
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    p:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #1976d2;
    }
  `]
})
export class AccountNotFoundDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AccountNotFoundDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountNotFoundDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onCreateAccount(): void {
    this.dialogRef.close(true);
  }
}
