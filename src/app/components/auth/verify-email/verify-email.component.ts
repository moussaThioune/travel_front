import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  template: `
<app-navbar></app-navbar>
<div class="ve-page">
  <div class="ve-card">

    <!-- Vérification en cours -->
    <div *ngIf="state === 'loading'" class="ve-state">
      <div class="ve-spinner"></div>
      <h2>Vérification en cours…</h2>
      <p>Veuillez patienter pendant que nous activons votre compte.</p>
    </div>

    <!-- Succès -->
    <div *ngIf="state === 'success'" class="ve-state ve-success">
      <div class="ve-icon">✅</div>
      <h2>Compte activé avec succès!</h2>
      <p>Bienvenue <strong>{{ userName }}</strong>! Votre compte est maintenant actif.</p>
      <div *ngIf="hasPendingBooking" class="ve-booking-notice">
        <span>✈️</span>
        <div>
          <strong>Réservation en attente</strong>
          <p>Vous allez être redirigé vers votre réservation pour <strong>{{ pendingTitre }}</strong>.</p>
        </div>
      </div>
      <p class="ve-redirect">Redirection automatique dans <strong>{{ countdown }}s</strong>…</p>
    </div>

    <!-- Erreur -->
    <div *ngIf="state === 'error'" class="ve-state ve-error">
      <div class="ve-icon">❌</div>
      <h2>Lien invalide ou expiré</h2>
      <p>{{ errorMsg }}</p>
      <div class="ve-actions">
        <button class="btn-voyageur btn-voyageur-teal" routerLink="/inscription">
          Recréer un compte
        </button>
        <button class="btn-voyageur" routerLink="/connexion" style="background:#f1f5f9;color:var(--ink)">
          Se connecter
        </button>
      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
.ve-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; background: var(--cream); padding: 40px 20px; }
.ve-card { background: white; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.10); padding: 60px 48px; max-width: 500px; width: 100%; text-align: center; }
.ve-state { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.ve-icon { font-size: 64px; }
h2 { font-size: 26px; font-weight: 800; color: var(--ink); margin: 0; }
p { color: var(--gray); font-size: 15px; line-height: 1.6; margin: 0; }
.ve-spinner { width: 52px; height: 52px; border: 4px solid #e2e8f0; border-top-color: var(--teal); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ve-booking-notice { display: flex; gap: 14px; align-items: flex-start; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 16px 20px; text-align: left; width: 100%;
  span { font-size: 28px; flex-shrink: 0; }
  strong { display: block; color: #166534; font-size: 15px; margin-bottom: 4px; }
  p { color: #166534; font-size: 13px; margin: 0; }
}
.ve-redirect { font-size: 14px; color: var(--gray); }
.ve-actions { display: flex; gap: 12px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
@media (max-width: 480px) { .ve-card { padding: 40px 24px; } }
  `]
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  userName = '';
  errorMsg = '';
  countdown = 4;
  hasPendingBooking = false;
  pendingTitre = '';
  private redirectUrl = '/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.state = 'error';
      this.errorMsg = 'Aucun token de vérification trouvé dans le lien.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.state = 'success';
        this.userName = res.firstName;

        const pending = this.authService.getPendingBooking();
        if (pending) {
          this.hasPendingBooking = true;
          this.pendingTitre = pending.voyageTitre;
          this.redirectUrl = pending.returnUrl;
        }

        this.startCountdown();
      },
      error: (err) => {
        this.state = 'error';
        this.errorMsg = err.message || 'Lien de vérification invalide ou expiré.';
      }
    });
  }

  private startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.router.navigate([this.redirectUrl]);
      }
    }, 1000);
  }
}
