import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-register',
  template: `
<app-navbar></app-navbar>
<div class="auth-page">
  <div class="auth-split">
    <div class="auth-visual">
      <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=85" alt="inscription">
      <div class="av-overlay"></div>
      <div class="av-content">
        <h2>Commencez votre<br><em>aventure</em> avec nous</h2>
        <p>Rejoignez plus de 12 000 voyageurs et accédez à des destinations d'exception à prix exclusifs.</p>
        <ul class="av-perks">
          <li><span>✓</span> Réservation en quelques clics</li>
          <li><span>✓</span> Suivi temps réel de votre voyage</li>
          <li><span>✓</span> Notifications personnalisées</li>
          <li><span>✓</span> Service client 7j/7</li>
          <li><span>✓</span> 10% de réduction sur le 1er voyage</li>
        </ul>
      </div>
    </div>

    <div class="auth-form-wrap">
      <div class="auth-form-inner" *ngIf="!emailSent">
        <div class="auth-logo" routerLink="/" style="cursor:pointer">✈️ <span>Voyag<em>eur</em></span></div>
        <h1>Créer un compte</h1>
        <p class="auth-subtitle">Gratuit, sans engagement. En 2 minutes.</p>

        <div class="form-voyageur" style="margin-top:28px">
          <div class="form-section-title">Informations personnelles</div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Prénom *</label>
              <input type="text" class="form-control" [(ngModel)]="firstName" placeholder="Jean"
                     [class.error]="errors['firstName']">
              <div class="form-error" *ngIf="errors['firstName']">
                <i class="bi bi-exclamation-circle"></i> {{ errors['firstName'] }}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input type="text" class="form-control" [(ngModel)]="lastName" placeholder="Dupont"
                     [class.error]="errors['lastName']">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <div class="input-icon-wrap">
              <i class="bi bi-envelope-fill"></i>
              <input type="email" class="form-control" [(ngModel)]="email"
                     placeholder="jean.dupont&#64;email.com" [class.error]="errors['email']">
            </div>
            <div class="form-error" *ngIf="errors['email']"><i class="bi bi-exclamation-circle"></i> {{ errors['email'] }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <div class="input-icon-wrap">
              <i class="bi bi-telephone-fill"></i>
              <input type="tel" class="form-control" [(ngModel)]="phone" placeholder="+33 6 12 34 56 78">
            </div>
          </div>

          <div class="form-section-title">Sécurité</div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Mot de passe *</label>
              <div class="input-icon-wrap">
                <i class="bi bi-lock-fill"></i>
                <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                       [(ngModel)]="password" placeholder="••••••••" [class.error]="errors['password']">
                <button class="toggle-pwd" (click)="showPwd = !showPwd">
                  <i [class]="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div class="form-hint">Minimum 6 caractères</div>
              <div class="pwd-strength" *ngIf="password">
                <div class="ps-bar" [style.width.%]="pwdStrength" [class]="pwdStrengthClass"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirmer *</label>
              <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                     [(ngModel)]="confirmPwd" placeholder="••••••••" [class.error]="errors['confirmPwd']">
              <div class="form-error" *ngIf="errors['confirmPwd']"><i class="bi bi-exclamation-circle"></i> {{ errors['confirmPwd'] }}</div>
            </div>
          </div>

          <div class="terms-check">
            <label>
              <input type="checkbox" [(ngModel)]="acceptTerms" style="accent-color:var(--teal)">
              <span>J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a> et la <a href="#" class="terms-link">politique de confidentialité</a> *</span>
            </label>
          </div>
          <div class="terms-check">
            <label>
              <input type="checkbox" [(ngModel)]="acceptNewsletter" style="accent-color:var(--teal)">
              <span>Recevoir les offres exclusives par email</span>
            </label>
          </div>
        </div>

        <div class="auth-error" *ngIf="globalError">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ globalError }}
        </div>

        <button class="btn-voyageur btn-voyageur-teal btn-voyageur-full btn-voyageur-lg"
                (click)="doRegister()" [disabled]="loading" style="margin-top:20px">
          <span *ngIf="!loading">Créer mon compte <i class="bi bi-arrow-right ms-1"></i></span>
          <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Création…</span>
        </button>

        <div class="auth-switch" style="margin-top:20px">
          Déjà un compte?
          <a routerLink="/connexion">Se connecter</a>
        </div>
      </div>

      <!-- ===== ÉTAT: EMAIL ENVOYÉ ===== -->
      <div class="auth-form-inner" *ngIf="emailSent">
        <div class="auth-logo" routerLink="/" style="cursor:pointer">✈️ <span>Voyag<em>eur</em></span></div>
        <div class="email-sent-card">
          <div class="es-icon">📧</div>
          <h2>Vérifiez votre boite mail</h2>
          <p>Un email de confirmation a été envoyé à</p>
          <strong class="es-email">{{ registeredEmail }}</strong>
          <p style="margin-top:16px;color:#888;font-size:14px">
            Cliquez sur le lien dans l'email pour activer votre compte et commencer à réserver vos voyages.
          </p>
          <div class="es-steps">
            <div class="es-step"><span>1</span> Ouvrez votre boite mail</div>
            <div class="es-step"><span>2</span> Cliquez sur "Activer mon compte"</div>
            <div class="es-step"><span>3</span> Vous serez connecté automatiquement</div>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#aaa">
            Pas reçu? Vérifiez vos spams ou <a href="#" (click)="resendEmail($event)" style="color:var(--teal)">renvoyer l'email</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.auth-page { min-height: 100vh; background: var(--cream); }
.auth-split { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
.auth-visual { position: relative; overflow: hidden;
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .av-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10,40,40,0.88), rgba(15,69,69,0.72)); z-index: 1; }
  .av-content { position: relative; z-index: 2; padding: 120px 60px; color: white;
    h2 { font-size: 38px; font-weight: 900; color: white; letter-spacing: -1px; margin-bottom: 16px; em { color: var(--gold); font-style: italic; } }
    p { font-size: 16px; color: rgba(255,255,255,0.72); line-height: 1.7; max-width: 380px; margin-bottom: 36px; }
  }
  .av-perks { list-style: none; display: flex; flex-direction: column; gap: 12px;
    li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: rgba(255,255,255,0.85);
      span { color: var(--gold); font-weight: 700; font-size: 16px; }
    }
  }
}
.auth-form-wrap { display: flex; align-items: flex-start; justify-content: center; padding: 80px 40px 40px; background: white; overflow-y: auto; }
.auth-form-inner { width: 100%; max-width: 440px; }
.auth-logo { font-family: 'Playfair Display',serif; font-size: 22px; font-weight: 900; color: var(--ink); margin-bottom: 28px; display: flex; align-items: center; gap: 8px;
  em { color: var(--gold); font-style: normal; } span { display: flex; }
}
h1 { font-size: 32px; font-weight: 900; color: var(--ink); letter-spacing: -1px; margin-bottom: 6px; }
.auth-subtitle { font-size: 15px; color: var(--gray); }
.input-icon-wrap { position: relative; display: flex; align-items: center;
  i { position: absolute; left: 14px; color: var(--teal); font-size: 13px; z-index: 1; }
  .form-control { padding-left: 40px !important; width: 100%; }
  .toggle-pwd { position: absolute; right: 14px; background: none; border: none; color: var(--gray); cursor: pointer; font-size: 16px; &:hover { color: var(--teal); } }
}
.pwd-strength { height: 3px; background: var(--sand); border-radius: 2px; margin-top: 8px;
  .ps-bar { height: 100%; border-radius: 2px; transition: all 0.4s;
    &.weak { background: var(--coral); }
    &.medium { background: var(--gold); }
    &.strong { background: #22c55e; }
  }
}
.terms-check { margin-bottom: 12px;
  label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 13px; color: var(--gray); line-height: 1.5; }
  .terms-link { color: var(--teal); text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
}
.auth-error { background: rgba(232,98,74,0.08); border: 1px solid rgba(232,98,74,0.25); color: var(--coral); border-radius: 10px; padding: 12px 16px; font-size: 14px; display: flex; gap: 8px; align-items: center; }
.auth-switch { text-align: center; font-size: 14px; color: var(--gray);
  a { color: var(--teal); font-weight: 600; text-decoration: none; margin-left: 4px; &:hover { text-decoration: underline; } }
}
.email-sent-card { text-align: center; padding: 40px 20px;
  .es-icon { font-size: 64px; margin-bottom: 20px; }
  h2 { font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 12px; }
  p { color: var(--gray); font-size: 15px; line-height: 1.6; }
  .es-email { display: block; background: var(--cream); border: 1.5px solid var(--teal); color: var(--teal); border-radius: 8px; padding: 10px 16px; font-size: 16px; margin: 8px 0; }
  .es-steps { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; text-align: left;
    .es-step { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--ink);
      span { width: 28px; height: 28px; background: var(--teal); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
    }
  }
}
@media (max-width: 768px) { .auth-split { grid-template-columns: 1fr; } .auth-visual { display: none; } }
  `]
})
export class RegisterComponent {
  firstName = ''; lastName = ''; email = ''; phone = '';
  password = ''; confirmPwd = '';
  showPwd = false;
  acceptTerms = false; acceptNewsletter = false;
  loading = false;
  globalError = '';
  errors: Record<string, string> = {};
  emailSent = false;
  registeredEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notif: NotificationService
  ) {
    if (this.authService.isLoggedIn()) this.router.navigate(['/']);
  }

  get pwdStrength(): number {
    if (!this.password) return 0;
    let score = 0;
    if (this.password.length >= 6) score += 33;
    if (this.password.length >= 10) score += 33;
    if (/[A-Z]/.test(this.password) && /[0-9]/.test(this.password)) score += 34;
    return score;
  }

  get pwdStrengthClass(): string {
    return this.pwdStrength < 40 ? 'weak' : this.pwdStrength < 80 ? 'medium' : 'strong';
  }

  doRegister(): void {
    this.errors = {};
    this.globalError = '';
    if (!this.firstName.trim()) this.errors['firstName'] = 'Prénom requis';
    if (!this.lastName.trim()) this.errors['lastName'] = 'Nom requis';
    if (!this.email.includes('@')) this.errors['email'] = 'Email invalide';
    if (this.password.length < 6) this.errors['password'] = 'Minimum 6 caractères';
    if (this.password !== this.confirmPwd) this.errors['confirmPwd'] = 'Les mots de passe ne correspondent pas';
    if (!this.acceptTerms) { this.globalError = 'Veuillez accepter les conditions d\'utilisation.'; return; }
    if (Object.keys(this.errors).length > 0) return;

    this.loading = true;
    this.authService.register({
      firstName: this.firstName, lastName: this.lastName,
      email: this.email, password: this.password, phone: this.phone
    }).subscribe({
      next: () => {
        this.loading = false;
        this.registeredEmail = this.email;
        this.emailSent = true;
      },
      error: (err) => { this.loading = false; this.globalError = err.message || 'Erreur lors de l\'inscription.'; }
    });
  }

  resendEmail(event: Event): void {
    event.preventDefault();
    if (!this.registeredEmail) return;
    this.authService.resendVerification(this.registeredEmail).subscribe({
      next: () => this.notif.show('📧', 'Email renvoyé', `Un nouvel email a été envoyé à ${this.registeredEmail}`, 'success'),
      error: (err) => this.notif.show('❌', 'Erreur', err.message, 'error')
    });
  }
}
