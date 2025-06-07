import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['verifyEmail', 'resendVerificationCode']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should verify email successfully', () => {
    component.email = 'test@example.com';
    component.verifyForm.patchValue({ code: '123456' });
    authService.verifyEmail.and.returnValue(of({}));

    component.onSubmit();

    expect(authService.verifyEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      verificationCode: '123456'
    });
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should handle verification error', () => {
    component.email = 'test@example.com';
    component.verifyForm.patchValue({ code: '123456' });
    authService.verifyEmail.and.returnValue(throwError(() => new Error('Invalid code')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid verification code. Please try again.');
  });
});
