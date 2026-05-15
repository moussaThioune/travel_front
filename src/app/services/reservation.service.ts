import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Reservation, ReservationRequest, ReservationStatut, TimelineEvent } from '../models/models';
import { AuthService } from './auth.service';
import { VoyageService } from './voyage.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private _reservations = signal<Reservation[]>([]);
  readonly reservations = this._reservations.asReadonly();

  readonly myReservations = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this._reservations().filter(r => r.client.email === user.email);
  });

  readonly stats = computed(() => ({
    total: this.myReservations().length,
    paid: this.myReservations().filter(r => r.statut === 'PAYEE').length,
    pending: this.myReservations().filter(r => r.statut === 'EN_ATTENTE').length,
    totalSpent: this.myReservations().reduce((s, r) => s + r.montantPaye, 0)
  }));

  constructor(
    private authService: AuthService,
    private voyageService: VoyageService,
    private notifService: NotificationService
  ) {
    this.loadFromStorage();
  }

  create(req: ReservationRequest): Observable<Reservation> {
    const user = this.authService.currentUser();
    if (!user) return throwError(() => ({ message: 'Non authentifié' }));

    const voyage = this.voyageService.voyages().find(v => v.id === req.voyageId);
    if (!voyage) return throwError(() => ({ message: 'Voyage non trouvé' }));
    if (voyage.nombrePlacesDisponibles < req.nombrePersonnes)
      return throwError(() => ({ message: `Seulement ${voyage.nombrePlacesDisponibles} place(s) disponible(s).` }));

    const ref = 'VYG-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const reservation: Reservation = {
      id: Date.now(),
      numeroReservation: ref,
      client: { id: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: (user as any).phone },
      voyage,
      nombrePersonnes: req.nombrePersonnes,
      prixTotal: req.nombrePersonnes * voyage.prixParPersonne,
      statut: 'EN_ATTENTE',
      dateReservation: new Date().toISOString(),
      notes: req.notes, typeHebergement: req.typeHebergement, passportNumber: req.passportNumber,
      montantPaye: 0,
      montantRestant: req.nombrePersonnes * voyage.prixParPersonne,
      timeline: this.buildTimeline(ref, voyage),
      paiements: []
    };

    return of(reservation).pipe(
      delay(900),
      tap(res => {
        this._reservations.update(r => [res, ...r]);
        this.voyageService.reduceAvailability(req.voyageId, req.nombrePersonnes);
        this.saveToStorage();
        this.notifService.addAppNotification({
          icon: '✅', title: 'Réservation créée!',
          message: `${ref} — ${voyage.titre}`, type: 'success', reservationRef: ref
        });
      })
    );
  }

  // Marquer comme payée (appel après paiement réussi)
  markPaid(reservationId: number, montant: number): void {
    this._reservations.update(list =>
      list.map(r => {
        if (r.id !== reservationId) return r;
        const newPaid = r.montantPaye + montant;
        const newStatut: ReservationStatut = newPaid >= r.prixTotal ? 'PAYEE' : 'CONFIRMEE';
        return {
          ...r,
          montantPaye: newPaid,
          montantRestant: Math.max(0, r.prixTotal - newPaid),
          statut: newStatut,
          timeline: this.advanceTimeline(r.timeline || [])
        };
      })
    );
    this.saveToStorage();

    const res = this._reservations().find(r => r.id === reservationId);
    if (res) {
      setTimeout(() => {
        this.advanceTimelineById(reservationId);
        this.notifService.show('📧', 'Email envoyé', `Confirmation envoyée à ${res.client.email}`, 'info');
      }, 2500);
      setTimeout(() => {
        this.advanceTimelineById(reservationId);
        this.notifService.show('🔍', 'Dossier en cours', 'Notre équipe traite votre dossier.', 'info');
      }, 6000);
    }
  }

  // Admin: valider manuellement un paiement mobile money (met aussi à jour la réservation)
  validateMobilePayment(reservationId: number, montant: number): void {
    this.markPaid(reservationId, montant);
  }

  cancel(id: number): Observable<Reservation> {
    const res = this._reservations().find(r => r.id === id);
    if (!res) return throwError(() => ({ message: 'Réservation introuvable' }));
    if (res.statut === 'PAYEE') return throwError(() => ({ message: 'Impossible d\'annuler une réservation payée.' }));

    return of(res).pipe(
      delay(600),
      tap(() => {
        this._reservations.update(list =>
          list.map(r => r.id === id ? { ...r, statut: 'ANNULEE' as ReservationStatut } : r)
        );
        this.voyageService.reduceAvailability(res.voyage.id, -res.nombrePersonnes);
        this.saveToStorage();
        this.notifService.show('❌', 'Réservation annulée', `${res.numeroReservation}`, 'warning');
      })
    );
  }

  simulateStatusUpdate(id: number): void {
    const res = this._reservations().find(r => r.id === id);
    if (!res?.timeline) return;
    const currentIdx = res.timeline.findIndex(t => t.current && !t.done);
    if (currentIdx < 0 || currentIdx >= res.timeline.length - 1) return;
    this.advanceTimelineById(id);
    const next = res.timeline[currentIdx + 1];
    if (next) this.notifService.show(next.icon, next.title, next.description, 'info');
  }

  getAllForAdmin(): Observable<Reservation[]> {
    return of(this._reservations()).pipe(delay(300));
  }

  getById(id: number): Reservation | undefined {
    return this._reservations().find(r => r.id === id);
  }

  // Admin: changer statut
  updateStatut(id: number, statut: ReservationStatut): void {
    this._reservations.update(list =>
      list.map(r => r.id === id ? { ...r, statut } : r)
    );
    this.saveToStorage();
  }

  private buildTimeline(ref: string, voyage: any): TimelineEvent[] {
    return [
      { icon: '📋', title: 'Réservation enregistrée', description: `Réf. ${ref} créée avec succès.`, date: new Date().toLocaleDateString('fr-FR'), done: true, current: false },
      { icon: '💳', title: 'Paiement en attente', description: 'En attente de votre règlement.', done: false, current: true },
      { icon: '📧', title: 'Confirmation envoyée', description: 'Email de confirmation expédié.', done: false },
      { icon: '🔍', title: 'Vérification dossier', description: 'Notre équipe traite votre dossier.', done: false },
      { icon: '🏨', title: 'Hébergement confirmé', description: `${voyage.hotel?.nom || 'Hôtel'} confirmé.`, done: false },
      { icon: '✈️', title: 'Prêt à voyager!', description: `Départ le ${new Date(voyage.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.`, done: false }
    ];
  }

  private advanceTimeline(timeline: TimelineEvent[]): TimelineEvent[] {
    const currentIdx = timeline.findIndex(t => t.current && !t.done);
    if (currentIdx < 0) return timeline;
    return timeline.map((t, i) => {
      if (i === currentIdx) return { ...t, done: true, current: false, date: new Date().toLocaleDateString('fr-FR') };
      if (i === currentIdx + 1) return { ...t, current: true };
      return t;
    });
  }

  private advanceTimelineById(id: number): void {
    this._reservations.update(list =>
      list.map(r => r.id !== id ? r : { ...r, timeline: this.advanceTimeline(r.timeline || []) })
    );
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem('vgr_reservations', JSON.stringify(this._reservations()));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('vgr_reservations');
      if (stored) this._reservations.set(JSON.parse(stored));
      // Also try old key
      const old = localStorage.getItem('voyageur_reservations');
      if (old && !stored) this._reservations.set(JSON.parse(old));
    } catch { /* ignore */ }
  }
}
