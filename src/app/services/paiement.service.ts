import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Paiement, PaiementRequest, PaiementStatut, ModePaiement } from '../models/models';
import { MobileMoneyService } from './mobile-money.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private _paiements = signal<Paiement[]>([]);
  readonly paiements = this._paiements.asReadonly();

  readonly allPaiements = computed(() => this._paiements());

  readonly mobileMoneyPending = computed(() =>
    this._paiements().filter(p =>
      ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(p.modePaiement) &&
      p.statut === 'EN_ATTENTE'
    )
  );

  readonly stats = computed(() => {
    const all = this._paiements();
    return {
      total: all.length,
      enAttente: all.filter(p => p.statut === 'EN_ATTENTE').length,
      enCours: all.filter(p => p.statut === 'EN_COURS').length,
      succes: all.filter(p => p.statut === 'SUCCES').length,
      echec: all.filter(p => p.statut === 'ECHEC').length,
      montantTotal: all.filter(p => p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      orangeMoney: all.filter(p => p.modePaiement === 'ORANGE_MONEY' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      wave: all.filter(p => p.modePaiement === 'WAVE' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      freeMoney: all.filter(p => p.modePaiement === 'FREE_MONEY' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
    };
  });

  constructor(
    private mmService: MobileMoneyService,
    private notif: NotificationService,
    private authService: AuthService
  ) {
    this.loadFromStorage();
  }

  // Créer un paiement (côté client)
  createPaiement(req: PaiementRequest, clientNom: string, clientEmail: string, voyageTitre: string, voyageDestination: string, numeroReservation: string): Observable<Paiement> {
    const isMobile = ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(req.modePaiement);
    const initialStatut: PaiementStatut = isMobile ? 'EN_ATTENTE' : 'SUCCES';

    const paiement: Paiement = {
      id: Date.now(),
      numeroPaiement: this.mmService.generateRef(req.modePaiement),
      reservationId: req.reservationId,
      numeroReservation,
      clientNom,
      clientEmail,
      clientPhone: req.phoneNumber,
      montant: req.montant,
      modePaiement: req.modePaiement,
      statut: initialStatut,
      datePaiement: new Date().toISOString(),
      referenceTransaction: req.referenceTransaction || this.mmService.generateRef(req.modePaiement),
      phoneNumber: req.phoneNumber,
      notes: req.notes,
      voyageTitre,
      voyageDestination
    };

    return of(paiement).pipe(
      delay(isMobile ? 1200 : 1500),
      tap(p => {
        this._paiements.update(list => [p, ...list]);
        this.saveToStorage();

        if (isMobile) {
          const provider = this.mmService.getProvider(req.modePaiement);
          this.notif.show(
            provider?.emoji || '📱',
            `${provider?.label} — En attente`,
            `Votre paiement de ${p.montant.toLocaleString('fr-FR')} FCFA est en cours de validation.`,
            'info'
          );
        } else {
          this.notif.show('✅', 'Paiement reçu!', `${p.montant.toLocaleString('fr-FR')} € confirmé.`, 'success');
        }
      })
    );
  }

  // Admin: valider un paiement Mobile Money
  validerPaiement(id: number): Observable<Paiement> {
    const paiement = this._paiements().find(p => p.id === id);
    if (!paiement) return of(null as any);

    const admin = this.authService.currentUser();

    return of(paiement).pipe(
      delay(700),
      tap(() => {
        this._paiements.update(list =>
          list.map(p => p.id === id ? {
            ...p,
            statut: 'SUCCES' as PaiementStatut,
            validatedAt: new Date().toISOString(),
            validatedBy: admin ? `${admin.firstName} ${admin.lastName}` : 'Admin'
          } : p)
        );
        this.saveToStorage();
        this.notif.show('✅', 'Paiement validé!', `${paiement.numeroPaiement} — ${paiement.clientNom}`, 'success');
      })
    );
  }

  // Admin: rejeter un paiement
  rejeterPaiement(id: number, raison?: string): Observable<Paiement> {
    const paiement = this._paiements().find(p => p.id === id);
    if (!paiement) return of(null as any);

    return of(paiement).pipe(
      delay(500),
      tap(() => {
        this._paiements.update(list =>
          list.map(p => p.id === id ? {
            ...p,
            statut: 'ECHEC' as PaiementStatut,
            notes: raison || 'Rejeté par l\'administrateur'
          } : p)
        );
        this.saveToStorage();
        this.notif.show('❌', 'Paiement rejeté', `${paiement.numeroPaiement} — ${raison || ''}`, 'error');
      })
    );
  }

  getPaiementsForReservation(reservationId: number): Paiement[] {
    return this._paiements().filter(p => p.reservationId === reservationId);
  }

  getStatutLabel(s: PaiementStatut): { label: string; class: string; icon: string } {
    const map = {
      EN_ATTENTE: { label: 'En attente', class: 'pending', icon: '⏳' },
      EN_COURS:   { label: 'En cours',   class: 'processing', icon: '🔄' },
      SUCCES:     { label: 'Validé',     class: 'paid', icon: '✅' },
      ECHEC:      { label: 'Échoué',     class: 'cancelled', icon: '❌' },
      REMBOURSE:  { label: 'Remboursé',  class: 'pending', icon: '↩️' },
    };
    return map[s] || { label: s, class: 'pending', icon: '❓' };
  }

  private saveToStorage(): void {
    localStorage.setItem('vgr_paiements', JSON.stringify(this._paiements()));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('vgr_paiements');
      if (stored) this._paiements.set(JSON.parse(stored));
    } catch { /* ignore */ }
  }
}
