import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VoyagesComponent } from './components/voyages/voyages.component';
import { VoyageDetailComponent } from './components/voyage-detail/voyage-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { AdminComponent } from './components/admin/admin.component';
import { AssuresComponent } from './components/assures/assures.component';
import { NouvelAssureComponent } from './components/assures/nouvel-assure/nouvel-assure.component';
import { ImportAssureComponent } from './components/assures/import-assure/import-assure.component';
import { AvisComponent } from './components/avis/avis.component';
import { VolsComponent } from './components/vols/vols.component';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Voyageur — Accueil' },
  { path: 'voyages', component: VoyagesComponent, title: 'Voyageur — Voyages' },
  { path: 'voyages/:id', component: VoyageDetailComponent, title: 'Voyageur — Détail' },
  { path: 'connexion', component: LoginComponent, canActivate: [guestGuard], title: 'Voyageur — Connexion' },
  { path: 'inscription', component: RegisterComponent, canActivate: [guestGuard], title: 'Voyageur — Inscription' },
  { path: 'verify-email', component: VerifyEmailComponent, title: 'Voyageur — Activation du compte' },
  {
    path: 'mes-reservations',
    component: ReservationsComponent,
    canActivate: [authGuard],
    title: 'Voyageur — Mes Réservations'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Voyageur — Administration'
  },
  {
    path: 'assures',
    component: AssuresComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Voyageur — Liste des Assureurs'
  },
  {
    path: 'assures/nouveau',
    component: NouvelAssureComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Voyageur — Nouvel assuré'
  },
  {
    path: 'assures/import',
    component: ImportAssureComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Voyageur — Import Assurés'
  },
  { path: 'avis', component: AvisComponent, title: 'Voyageur — Avis clients' },
  { path: 'vols', component: VolsComponent, title: 'Voyageur — Recherche de vols' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
