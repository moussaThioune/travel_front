import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { PaiementService } from '../../services/paiement.service';
import { MobileMoneyService } from '../../services/mobile-money.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Reservation, Paiement } from '../../models/models';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  openCardId: number | null = null;
  cancellingId: number | null = null;

  constructor(
    public reservationService: ReservationService,
    public paiementService: PaiementService,
    public mmService: MobileMoneyService,
    public authService: AuthService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {}

  get reservations(): Reservation[] {
    return this.reservationService.myReservations();
  }

  get stats() {
    return this.reservationService.stats();
  }

  toggleCard(id: number): void {
    this.openCardId = this.openCardId === id ? null : id;
  }

  simulateUpdate(res: Reservation): void {
    this.reservationService.simulateStatusUpdate(res.id);
  }

  confirmCancel(res: Reservation): void {
    if (!confirm(`Annuler la réservation ${res.numeroReservation} ?`)) return;
    this.cancellingId = res.id;
    this.reservationService.cancel(res.id).subscribe({
      next: () => { this.cancellingId = null; },
      error: (err) => {
        this.cancellingId = null;
        this.notifService.show('❌', 'Annulation impossible', err.message, 'error');
      }
    });
  }

  getPaiements(reservationId: number): Paiement[] {
    return this.paiementService.getPaiementsForReservation(reservationId);
  }

  statutLabel(s: string): string {
    return { EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', PAYEE: 'Payée', ANNULEE: 'Annulée' }[s] || s;
  }

  statutClass(s: string): string {
    return { EN_ATTENTE: 'pending', CONFIRMEE: 'confirmed', PAYEE: 'paid', ANNULEE: 'cancelled' }[s] || 'pending';
  }

  pmtStatutLabel(s: string): string {
    return this.paiementService.getStatutLabel(s as any).label;
  }

  pmtStatutClass(s: string): string {
    return this.paiementService.getStatutLabel(s as any).class;
  }

  modeLabel(m: string): string {
    return this.mmService.getLabelForMode(m);
  }

  isMobile(m: string): boolean {
    return ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(m);
  }

  hasMobileMoneyPending(reservationId: number): boolean {
    return this.getPaiements(reservationId).some(
      p => this.isMobile(p.modePaiement) && p.statut === 'EN_ATTENTE'
    );
  }

  paidPercent(res: Reservation): number {
    if (!res.prixTotal) return 0;
    return Math.min(100, Math.round((res.montantPaye / res.prixTotal) * 100));
  }

  trackById(i: number, r: any): number { return r.id; }
}
