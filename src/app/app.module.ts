import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { VoyageCardComponent } from './components/voyage-card/voyage-card.component';
import { VoyagesComponent } from './components/voyages/voyages.component';
import { VoyageDetailComponent } from './components/voyage-detail/voyage-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { AdminComponent } from './components/admin/admin.component';
import { AssuresComponent } from './components/assures/assures.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';

// Pipes
import { FrenchDatePipe, EuroPricePipe, ReservationStatutPipe, VoyageCategoriePipe, TruncatePipe } from './pipes/custom.pipes';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    VoyageCardComponent,
    VoyagesComponent,
    VoyageDetailComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    ReservationsComponent,
    AdminComponent,
    AssuresComponent,
    FooterComponent,
    ToastComponent,
    FrenchDatePipe,
    EuroPricePipe,
    ReservationStatutPipe,
    VoyageCategoriePipe,
    TruncatePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
