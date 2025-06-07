import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ServicesListComponent } from './components/services-list/services-list.component';
import { MyAppointmentsComponent } from './components/my-appointments/my-appointments.component';
import { authGuard } from './guards/auth-guard';
import { ServiceDetailComponent } from './components/service-detail/service-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'services', component: ServicesListComponent },
  { path: 'services/:id', component: ServiceDetailComponent },
  {
    path: 'my-appointments',
    component: MyAppointmentsComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/services', pathMatch: 'full' },
];
