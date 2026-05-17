import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  profile: ProfileData | null = null;
  loading = true;

  // Edit profile form
  editFirstName = '';
  editLastName = '';
  savingProfile = false;

  // Change password form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = false;
  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  activeSection: 'profile' | 'security' = 'profile';

  private readonly API = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.http.get<ProfileData>(`${this.API}/auth/profile`).subscribe({
      next: p => {
        this.profile = p;
        this.editFirstName = p.firstName;
        this.editLastName = p.lastName;
        this.loading = false;
      },
      error: () => {
        this.notif.show('❌', 'Erreur', 'Impossible de charger le profil.', 'error');
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    if (!this.editFirstName.trim() || !this.editLastName.trim()) {
      this.notif.show('⚠️', 'Champs requis', 'Veuillez remplir tous les champs.', 'error');
      return;
    }
    this.savingProfile = true;
    this.http.put<ProfileData>(`${this.API}/auth/profile`, {
      firstName: this.editFirstName.trim(),
      lastName: this.editLastName.trim()
    }).subscribe({
      next: p => {
        this.profile = p;
        this.notif.show('✅', 'Profil mis à jour', 'Vos informations ont été enregistrées.', 'success');
        this.savingProfile = false;
      },
      error: () => {
        this.notif.show('❌', 'Erreur', 'Impossible de mettre à jour le profil.', 'error');
        this.savingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.notif.show('⚠️', 'Champs requis', 'Veuillez remplir tous les champs.', 'error');
      return;
    }
    if (this.newPassword.length < 8) {
      this.notif.show('⚠️', 'Mot de passe trop court', 'Au moins 8 caractères requis.', 'error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.notif.show('⚠️', 'Mots de passe différents', 'La confirmation ne correspond pas.', 'error');
      return;
    }
    this.savingPassword = true;
    this.http.put(`${this.API}/auth/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.notif.show('✅', 'Mot de passe changé', 'Votre mot de passe a été mis à jour.', 'success');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.savingPassword = false;
      },
      error: (err) => {
        const msg = err.status === 400 ? 'Mot de passe actuel incorrect.' : 'Une erreur est survenue.';
        this.notif.show('❌', 'Erreur', msg, 'error');
        this.savingPassword = false;
      }
    });
  }

  get initials(): string {
    if (!this.profile) return '?';
    return (this.profile.firstName[0] + this.profile.lastName[0]).toUpperCase();
  }

  get roleLabel(): string {
    return this.profile?.role === 'ADMIN' ? 'Administrateur' : 'Client';
  }
}
