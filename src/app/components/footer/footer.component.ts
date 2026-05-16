import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
<footer class="site-footer">
  <div class="footer-main">
    <div class="section-wrapper footer-grid">
      <!-- Brand -->
      <div class="footer-brand">
        <div class="footer-logo">✈️ Voyag<span>eur</span></div>
        <p>{{ 'footer.desc' | translate }}</p>
        <div class="footer-socials">
          <a href="https://www.facebook.com/yvasvoyage" class="social-link" title="Facebook"><i class="bi bi-facebook"></i></a>
          <a href="https://www.instagram.com/yvasvoyage" class="social-link" title="Instagram"><i class="bi bi-instagram"></i></a>
          <a href="https://twitter.com/yvasvoyage" class="social-link" title="Twitter"><i class="bi bi-twitter-x"></i></a>
          <a href="https://www.tiktok.com/@yvasvoyage?_r=1&_t=ZS-96JB3kWkCaF" class="social-link" title="TikTok"><i class="bi bi-tiktok"></i></a>
          <a href="https://www.linkedin.com/company/yvasvoyage" class="social-link" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
        </div>
      </div>

      <!-- Navigation -->
      <div class="footer-col">
        <h4>{{ 'footer.navigation' | translate }}</h4>
        <ul>
          <li><a routerLink="/">{{ 'footer.home' | translate }}</a></li>
          <li><a routerLink="/voyages">{{ 'footer.ourVoyages' | translate }}</a></li>
          <li><a routerLink="/destinations">{{ 'footer.destinations' | translate }}</a></li>
          <li><a routerLink="/mes-reservations">{{ 'footer.myReservations' | translate }}</a></li>
          <li><a routerLink="/avis">Avis clients ⭐</a></li>
          <li><a routerLink="/inscription">{{ 'footer.createAccount' | translate }}</a></li>
        </ul>
      </div>

      <!-- Services -->
      <div class="footer-col">
        <h4>{{ 'footer.services' | translate }}</h4>
        <ul>
          <li><a href="#">{{ 'footer.customTrips' | translate }}</a></li>
          <li><a href="#">{{ 'footer.groupTrips' | translate }}</a></li>
          <li><a href="#">{{ 'footer.honeymoon' | translate }}</a></li>
          <li><a href="#">{{ 'footer.business' | translate }}</a></li>
          <li><a href="#">{{ 'footer.insurance' | translate }}</a></li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="footer-col">
        <h4>{{ 'footer.contact' | translate }}</h4>
        <ul class="contact-list">
          <li><i class="bi bi-geo-alt-fill"></i><span>rue Baye Seydi Thiaw<br>Yoff, Dakar</span></li>
          <li><i class="bi bi-telephone-fill"></i><span>+221 78 143 44 44</span></li>
          <li><i class="bi bi-telephone-fill"></i><span>+221 77 426 25 43</span></li>
          <li><i class="bi bi-envelope-fill"></i><span>yvasvoyage&#64;gmail.com</span></li>
          <li><i class="bi bi-clock-fill"></i><span>{{ 'footer.schedule' | translate }}</span></li>
        </ul>

        <!-- Newsletter -->
        <div class="footer-newsletter">
          <div class="fn-label">{{ 'footer.newsletter' | translate }}</div>
          <div class="fn-form">
            <input type="email" [(ngModel)]="newsletterEmail" [placeholder]="'footer.emailPlaceholder' | translate">
            <button (click)="subscribe()"><i class="bi bi-send-fill"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="section-wrapper fb-inner">
      <div class="fb-copy">
        © {{ year }} Yvoyage SAS —
        <a href="#">{{ 'footer.legal' | translate }}</a> ·
        <a href="#">{{ 'footer.privacy' | translate }}</a> ·
        <a href="#">{{ 'footer.cgv' | translate }}</a>
      </div>
      <div class="fb-badges">
        <span class="fb-badge"><i class="bi bi-shield-lock-fill"></i> {{ 'footer.ssl' | translate }}</span>
        <span class="fb-badge"><i class="bi bi-patch-check-fill"></i> {{ 'footer.iata' | translate }}</span>
        <span class="fb-badge"><i class="bi bi-award-fill"></i> {{ 'footer.apst' | translate }}</span>
        <span class="fb-badge"><i class="bi bi-credit-card-fill"></i> {{ 'footer.securePay' | translate }}</span>
      </div>
    </div>
  </div>
</footer>
  `,
  styles: [`
.site-footer { background: var(--ink); }

.footer-main { padding: 80px 0 60px; }

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.4fr;
  gap: 60px;

  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; gap: 40px; }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.footer-brand {
  p { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.8; max-width: 290px; margin-bottom: 24px; }
}

.footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 900;
  color: white;
  margin-bottom: 16px;
  span { color: var(--gold); }
}

.footer-socials {
  display: flex;
  gap: 10px;
}

.social-link {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  text-decoration: none;
  transition: var(--transition);

  &:hover { background: var(--gold); border-color: var(--gold); color: var(--ink); transform: translateY(-2px); }
}

.footer-col {
  h4 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; }
  ul { list-style: none; }
  li { margin-bottom: 10px; }
  a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; transition: color 0.2s; line-height: 1.5;
    &:hover { color: var(--gold); }
  }
}

.contact-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  i { color: var(--gold); font-size: 14px; margin-top: 2px; flex-shrink: 0; }
  span { color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.6; }
}

.footer-newsletter {
  margin-top: 24px;
  .fn-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
  .fn-form { display: flex; gap: 0; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);
    input { flex: 1; background: rgba(255,255,255,0.08); border: none; color: white; padding: 11px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none;
      &::placeholder { color: rgba(255,255,255,0.35); }
    }
    button { background: var(--gold); border: none; color: var(--ink); padding: 11px 16px; cursor: pointer; font-size: 14px; transition: background 0.2s; &:hover { background: var(--gold-light); } }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 24px 0;
}

.fb-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.fb-copy {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  a { color: rgba(255,255,255,0.4); text-decoration: none; margin: 0 4px; &:hover { color: var(--gold); } }
}

.fb-badges { display: flex; gap: 10px; flex-wrap: wrap; }
.fb-badge {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45);
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  i { color: var(--gold); font-size: 11px; }
}
  `]
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  newsletterEmail = '';

  subscribe(): void {
    if (this.newsletterEmail.includes('@')) {
      alert('Merci pour votre inscription!');
      this.newsletterEmail = '';
    }
  }
}
