import { Component } from '@angular/core';
import { ReviewService, Review } from '../../services/review.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-avis',
  template: `
<app-navbar></app-navbar>

<!-- HERO -->
<div class="avis-hero">
  <div class="ah-overlay"></div>
  <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1600&q=80" alt="" class="ah-bg">
  <div class="section-wrapper ah-content">
    <h1>Vos <em>avis</em> comptent</h1>
    <p>Partagez votre expérience et aidez d'autres voyageurs à choisir leur prochain séjour.</p>
    <div class="ah-stats">
      <div><strong>{{ reviewService.totalTravelers() | number:'1.0-0' }}</strong><span>Voyageurs</span></div>
      <div><strong>{{ reviewService.averageRating() }}<span class="star">★</span></strong><span>Note moyenne</span></div>
      <div><strong>{{ reviewService.reviews().length }}</strong><span>Avis partagés</span></div>
    </div>
  </div>
</div>

<!-- FORM -->
<div class="avis-section">
  <div class="section-wrapper">
    <div class="avis-grid">

      <!-- Formulaire -->
      <div class="avis-form-card card-voyageur">
        <h2>Laisser un avis</h2>
        <p class="avis-form-sub">Votre avis aide toute la communauté Voyageur.</p>

        <div class="form-group" *ngIf="!submitted">
          <label class="form-label">Votre nom *</label>
          <input type="text" class="form-control" [(ngModel)]="form.nom" placeholder="Jean Dupont"
                 [class.error]="errors['nom']">
          <div class="form-error" *ngIf="errors['nom']"><i class="bi bi-exclamation-circle"></i> {{ errors['nom'] }}</div>
        </div>

        <div class="form-group" *ngIf="!submitted">
          <label class="form-label">Voyage (optionnel)</label>
          <input type="text" class="form-control" [(ngModel)]="form.voyage" placeholder="Ex: Omra Premium, Bali…">
        </div>

        <div class="form-group" *ngIf="!submitted">
          <label class="form-label">Note (0 – 10) *</label>
          <div class="rating-wrap">
            <div class="rating-circles">
              <button *ngFor="let n of ratings" type="button"
                      class="rating-dot"
                      [class.selected]="form.note === n"
                      [class.highlight]="n <= form.note"
                      [style.background]="n <= form.note ? ratingColor(form.note) : ''"
                      (click)="form.note = n">{{ n }}</button>
            </div>
            <div class="rating-label" *ngIf="form.note >= 0" [style.color]="ratingColor(form.note)">
              {{ ratingLabel(form.note) }}
            </div>
          </div>
          <div class="form-error" *ngIf="errors['note']"><i class="bi bi-exclamation-circle"></i> {{ errors['note'] }}</div>
        </div>

        <div class="form-group" *ngIf="!submitted">
          <label class="form-label">Votre commentaire *</label>
          <textarea class="form-control" [(ngModel)]="form.commentaire" rows="5"
                    placeholder="Décrivez votre expérience : accueil, organisation, hébergement, rapport qualité/prix…"
                    [class.error]="errors['commentaire']" style="resize:vertical"></textarea>
          <div class="form-error" *ngIf="errors['commentaire']"><i class="bi bi-exclamation-circle"></i> {{ errors['commentaire'] }}</div>
          <div class="char-count" [class.near-limit]="form.commentaire.length > 450">{{ form.commentaire.length }}/500</div>
        </div>

        <button class="btn-voyageur btn-voyageur-teal btn-voyageur-full btn-voyageur-md"
                *ngIf="!submitted"
                (click)="submit()" [disabled]="loading">
          <span *ngIf="!loading"><i class="bi bi-send-fill me-2"></i>Publier mon avis</span>
          <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Envoi…</span>
        </button>

        <!-- Succès -->
        <div class="submit-success" *ngIf="submitted">
          <div class="ss-icon">🎉</div>
          <h3>Merci pour votre avis !</h3>
          <p>Votre témoignage aide des milliers de voyageurs à trouver leur séjour idéal.</p>
          <button class="btn-voyageur btn-voyageur-outline-teal btn-voyageur-md" style="margin-top:16px" (click)="reset()">
            <i class="bi bi-plus me-1"></i> Donner un autre avis
          </button>
        </div>
      </div>

      <!-- Liste des avis -->
      <div class="avis-list">
        <h2 style="margin-bottom:20px">{{ reviewService.reviews().length }} avis partagés</h2>

        <div class="avis-empty" *ngIf="!reviewService.reviews().length">
          <div class="ae-icon">💬</div>
          <p>Soyez le premier à partager votre expérience !</p>
        </div>

        <div class="avis-card card-voyageur" *ngFor="let r of reviewService.reviews()">
          <div class="ac-header">
            <div class="ac-avatar">{{ r.nom.charAt(0).toUpperCase() }}</div>
            <div class="ac-meta">
              <div class="ac-name">{{ r.nom }}</div>
              <div class="ac-trip" *ngIf="r.voyage">
                <i class="bi bi-geo-alt-fill text-teal"></i> {{ r.voyage }}
              </div>
              <div class="ac-date">{{ r.date | date:'d MMMM yyyy' }}</div>
            </div>
            <div class="ac-note" [style.background]="ratingColor(r.note)">{{ r.note }}/10</div>
          </div>
          <p class="ac-comment">{{ r.commentaire }}</p>
        </div>
      </div>

    </div>
  </div>
</div>

<app-footer></app-footer>
  `,
  styles: [`
.avis-hero {
  position: relative; min-height: 380px; display: flex; align-items: center;
  .ah-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .ah-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10,40,40,0.85), rgba(15,69,69,0.7)); z-index: 1; }
  .ah-content { position: relative; z-index: 2; padding: 80px 0 60px; color: white;
    h1 { font-size: 48px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 12px;
      em { color: var(--gold); font-style: italic; }
    }
    p { font-size: 18px; color: rgba(255,255,255,0.78); max-width: 520px; line-height: 1.7; margin-bottom: 36px; }
  }
}
.ah-stats { display: flex; gap: 40px; flex-wrap: wrap;
  div { text-align: center;
    strong { display: block; font-size: 32px; font-weight: 900; color: white; }
    span { font-size: 13px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
    .star { color: var(--gold); }
  }
}

.avis-section { background: var(--cream); padding: 60px 0 80px; }
.avis-grid { display: grid; grid-template-columns: 420px 1fr; gap: 32px; align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.avis-form-card { padding: 32px; position: sticky; top: 90px;
  h2 { font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
}
.avis-form-sub { font-size: 14px; color: var(--gray); margin-bottom: 24px; }

.rating-wrap { margin-top: 8px; }
.rating-circles { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.rating-dot {
  width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--sand);
  background: white; font-size: 14px; font-weight: 700; color: var(--gray);
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
  &.selected { border-color: transparent; color: white; transform: scale(1.15); }
  &.highlight { border-color: transparent; color: white; }
  &:hover { transform: scale(1.1); border-color: var(--teal); }
}
.rating-label { font-size: 14px; font-weight: 700; margin-top: 4px; }
.char-count { font-size: 12px; color: var(--gray); text-align: right; margin-top: 4px;
  &.near-limit { color: var(--coral); }
}

.submit-success { text-align: center; padding: 32px 16px;
  .ss-icon { font-size: 56px; margin-bottom: 16px; }
  h3 { font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
  p { font-size: 15px; color: var(--gray); line-height: 1.6; }
}

.avis-empty { text-align: center; padding: 40px;
  .ae-icon { font-size: 48px; margin-bottom: 12px; }
  p { color: var(--gray); font-size: 15px; }
}

.avis-card { padding: 20px 24px; margin-bottom: 16px;
  .ac-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .ac-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--teal); color: white; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ac-meta { flex: 1;
    .ac-name { font-weight: 700; color: var(--ink); font-size: 15px; }
    .ac-trip { font-size: 13px; color: var(--gray); margin-top: 2px; }
    .ac-date { font-size: 12px; color: var(--gray); margin-top: 2px; }
  }
  .ac-note { color: white; font-weight: 800; font-size: 14px; padding: 6px 12px; border-radius: 20px; flex-shrink: 0; }
  .ac-comment { font-size: 15px; color: var(--ink); line-height: 1.7; }
}
  `]
})
export class AvisComponent {
  form = { nom: '', voyage: '', note: -1, commentaire: '' };
  ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  errors: Record<string, string> = {};
  loading = false;
  submitted = false;

  constructor(
    public reviewService: ReviewService,
    private notif: NotificationService
  ) {}

  ratingColor(note: number): string {
    if (note <= 3) return '#e8624a';
    if (note <= 5) return '#f5a623';
    if (note <= 7) return '#1a6b6b';
    return '#22c55e';
  }

  ratingLabel(note: number): string {
    if (note <= 3) return 'Mauvais';
    if (note <= 5) return 'Passable';
    if (note <= 7) return 'Bien';
    if (note <= 9) return 'Très bien';
    return 'Excellent !';
  }

  submit(): void {
    this.errors = {};
    if (!this.form.nom.trim()) this.errors['nom'] = 'Votre nom est requis';
    if (this.form.note < 0) this.errors['note'] = 'Veuillez choisir une note';
    if (this.form.commentaire.trim().length < 10) this.errors['commentaire'] = 'Commentaire trop court (10 caractères min.)';
    if (this.form.commentaire.length > 500) this.errors['commentaire'] = 'Commentaire trop long (500 caractères max.)';
    if (Object.keys(this.errors).length) return;

    this.loading = true;
    setTimeout(() => {
      this.reviewService.submit({
        nom: this.form.nom.trim(),
        note: this.form.note,
        commentaire: this.form.commentaire.trim(),
        voyage: this.form.voyage.trim() || undefined
      });
      this.loading = false;
      this.submitted = true;
      this.notif.show('⭐', 'Avis publié !', 'Merci pour votre retour.', 'success');
    }, 600);
  }

  reset(): void {
    this.form = { nom: '', voyage: '', note: -1, commentaire: '' };
    this.errors = {};
    this.submitted = false;
  }
}
