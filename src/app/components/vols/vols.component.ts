import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DemandeVolService, DemandeVol, ModePaiement } from '../../services/demande-vol.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

export type TripType = 'aller-retour' | 'aller-simple';
export type CabinClass = 'Économie' | 'Économie Premium' | 'Affaires' | 'Première';

@Component({
  selector: 'app-vols',
  templateUrl: './vols.component.html',
  styleUrls: ['./vols.component.scss']
})
export class VolsComponent implements OnInit {

  // --- Tab ---
  activeTab: 'vols' | 'hotels' | 'voitures' = 'vols';

  // --- Trip type ---
  tripType: TripType = 'aller-retour';
  showTripTypeMenu = false;

  // --- Search fields ---
  from = 'Sénégal (SN)';
  to = '';

  // --- Dates ---
  departDate: Date | null = null;
  returnDate: Date | null = null;
  showCalendar = false;
  calendarTarget: 'depart' | 'retour' = 'depart';

  // Calendar navigation
  calendarLeft: Date = new Date();
  calendarRight: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  // Calendar weeks for left and right month
  leftWeeks: CalendarDay[][] = [];
  rightWeeks: CalendarDay[][] = [];

  readonly weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // --- Options ---
  nearbyFrom = false;
  nearbyTo = false;
  directOnly = false;
  datesFlexibles = false;

  // --- Passengers & class ---
  adults = 1;
  children = 0;
  infants = 0;
  cabinClass: CabinClass = 'Économie';
  showPassengerMenu = false;
  showClassMenu = false;

  readonly cabinClasses: CabinClass[] = ['Économie', 'Économie Premium', 'Affaires', 'Première'];

  get totalPassengers(): number {
    return this.adults + this.children + this.infants;
  }

  get passengerLabel(): string {
    const p = this.totalPassengers;
    const suffix = p > 1 ? 's' : '';
    return `${p} Adulte${suffix}`;
  }

  get passengerDetailLabel(): string {
    const parts: string[] = [`${this.adults} adulte${this.adults > 1 ? 's' : ''}`];
    if (this.children) parts.push(`${this.children} enfant${this.children > 1 ? 's' : ''}`);
    if (this.infants) parts.push(`${this.infants} bébé${this.infants > 1 ? 's' : ''}`);
    return parts.join(', ') + ', ' + this.cabinClass;
  }

  get departLabel(): string {
    return this.departDate ? this.formatDate(this.departDate) : '';
  }

  get returnLabel(): string {
    return this.returnDate ? this.formatDate(this.returnDate) : '';
  }

  submitting = false;
  showNotesModal = false;
  notesClient = '';

  // Results section
  showResults = false;
  processingId: number | null = null;

  // Payment modal
  showPaymentModal = false;
  payingDemande: DemandeVol | null = null;
  selectedPayMethod: ModePaiement = 'ORANGE_MONEY';
  payPhone = '';
  paySubmitting = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    public demandeVolService: DemandeVolService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    this.departDate = d;
    this.buildCalendars();

    if (this.authService.isLoggedIn()) {
      this.demandeVolService.loadMesDemandes();
    }
  }

  // =========== Trip type ===========
  setTripType(t: TripType): void {
    this.tripType = t;
    this.showTripTypeMenu = false;
    if (t === 'aller-simple') this.returnDate = null;
  }

  // =========== Swap ===========
  swapAirports(): void {
    [this.from, this.to] = [this.to, this.from];
  }

  // =========== Calendar ===========
  openCalendar(target: 'depart' | 'retour'): void {
    this.calendarTarget = target;
    if (target === 'retour' && this.departDate) {
      this.calendarLeft = new Date(this.departDate.getFullYear(), this.departDate.getMonth(), 1);
    } else {
      this.calendarLeft = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    this.calendarRight = new Date(this.calendarLeft.getFullYear(), this.calendarLeft.getMonth() + 1, 1);
    this.buildCalendars();
    this.showCalendar = true;
    this.showTripTypeMenu = false;
    this.showPassengerMenu = false;
  }

  closeCalendar(): void {
    this.showCalendar = false;
  }

  prevMonth(): void {
    const now = new Date();
    const minMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (this.calendarLeft <= minMonth) return;
    this.calendarLeft = new Date(this.calendarLeft.getFullYear(), this.calendarLeft.getMonth() - 1, 1);
    this.calendarRight = new Date(this.calendarLeft.getFullYear(), this.calendarLeft.getMonth() + 1, 1);
    this.buildCalendars();
  }

  nextMonth(): void {
    this.calendarLeft = new Date(this.calendarLeft.getFullYear(), this.calendarLeft.getMonth() + 1, 1);
    this.calendarRight = new Date(this.calendarLeft.getFullYear(), this.calendarLeft.getMonth() + 1, 1);
    this.buildCalendars();
  }

  selectDay(day: CalendarDay): void {
    if (day.isPast || !day.isCurrentMonth) return;

    if (this.calendarTarget === 'depart') {
      this.departDate = day.date;
      if (this.returnDate && this.returnDate <= day.date) this.returnDate = null;
      if (this.tripType === 'aller-retour') {
        this.calendarTarget = 'retour';
      } else {
        this.showCalendar = false;
      }
    } else {
      if (this.departDate && day.date <= this.departDate) {
        this.departDate = day.date;
        this.returnDate = null;
        this.calendarTarget = 'retour';
      } else {
        this.returnDate = day.date;
        this.showCalendar = false;
      }
    }
    this.buildCalendars();
  }

  applyDates(): void {
    this.showCalendar = false;
  }

  private buildCalendars(): void {
    this.leftWeeks = this.buildMonth(this.calendarLeft);
    this.rightWeeks = this.buildMonth(this.calendarRight);
  }

  private buildMonth(firstDay: Date): CalendarDay[][] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = firstDay.getFullYear();
    const month = firstDay.getMonth();

    const first = new Date(year, month, 1);
    // Monday-first: 0=Mon...6=Sun
    let startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const start = new Date(year, month, 1 - startDow);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getTime());
      d.setDate(start.getDate() + i);
      const isPast = d < today;
      const isSelected =
        (this.departDate && this.sameDay(d, this.departDate)) ||
        (this.returnDate && this.sameDay(d, this.returnDate)) || false;
      const isInRange = !!(
        this.departDate && this.returnDate &&
        d > this.departDate && d < this.returnDate
      );
      days.push({
        date: d, day: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: this.sameDay(d, today),
        isPast,
        isSelected,
        isInRange,
        isRangeStart: !!(this.departDate && this.sameDay(d, this.departDate) && this.returnDate),
        isRangeEnd: !!(this.returnDate && this.sameDay(d, this.returnDate))
      });
    }

    const weeks: CalendarDay[][] = [];
    for (let w = 0; w < 6; w++) {
      weeks.push(days.slice(w * 7, w * 7 + 7));
    }
    return weeks;
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  // =========== Passengers ===========
  openPassengers(): void {
    this.showPassengerMenu = !this.showPassengerMenu;
    this.showTripTypeMenu = false;
    this.showCalendar = false;
    this.showClassMenu = false;
  }

  changeCount(type: 'adults' | 'children' | 'infants', delta: number): void {
    if (type === 'adults') {
      this.adults = Math.max(1, Math.min(9, this.adults + delta));
    } else if (type === 'children') {
      this.children = Math.max(0, Math.min(8, this.children + delta));
    } else {
      this.infants = Math.max(0, Math.min(this.adults, this.infants + delta));
    }
  }

  selectClass(c: CabinClass): void {
    this.cabinClass = c;
    this.showClassMenu = false;
  }

  // =========== Close on outside click ===========
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.trip-type-wrap')) this.showTripTypeMenu = false;
    if (!target.closest('.passenger-wrap')) { this.showPassengerMenu = false; this.showClassMenu = false; }
    if (!target.closest('.date-field') && !target.closest('.calendar-dropdown')) this.showCalendar = false;
  }

  // =========== Submit ===========
  search(): void {
    if (!this.to.trim()) {
      this.notifService.show('⚠️', 'Destination manquante', 'Veuillez indiquer une destination.', 'error');
      return;
    }
    if (!this.departDate) {
      this.notifService.show('⚠️', 'Date manquante', 'Veuillez choisir une date de départ.', 'error');
      return;
    }
    this.showNotesModal = true;
  }

  submitDemande(): void {
    if (this.submitting) return;
    // Ask to login only at the moment of actual submission
    if (!this.authService.isLoggedIn()) {
      this.showNotesModal = false;
      this.router.navigate(['/connexion'], { queryParams: { redirect: '/vols' } });
      return;
    }
    this.submitting = true;
    this.showNotesModal = false;

    const req = {
      origine: this.from,
      destination: this.to,
      dateDepart: this.departDate!.toISOString().split('T')[0],
      dateRetour: this.returnDate ? this.returnDate.toISOString().split('T')[0] : null,
      typeVoyage: this.tripType,
      nbAdultes: this.adults,
      nbEnfants: this.children,
      nbBebes: this.infants,
      classeVoyage: this.cabinClass,
      volsDirects: this.directOnly,
      aeroportsProximiteOrigine: this.nearbyFrom,
      aeroportsProximiteDestination: this.nearbyTo,
      notesClient: this.notesClient || undefined
    };

    this.demandeVolService.submit(req).subscribe({
      next: () => {
        this.notifService.show('✈️', 'Demande envoyée !', 'Vous recevrez une réponse par email sous 24h.', 'success');
        this.submitting = false;
        this.showResults = true;
        // Scroll to results
        setTimeout(() => {
          document.getElementById('vol-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        this.submitting = false;
      }
    });
  }

  get mesDemandes() {
    return this.demandeVolService.mesDemandes();
  }

  accepterOffre(id: number): void {
    if (this.processingId) return;
    this.processingId = id;
    this.demandeVolService.accepter(id).subscribe({
      next: () => {
        this.notifService.show('✅', 'Tarifs acceptés !', 'Notre équipe va valider votre réservation sous 2h.', 'success');
        this.processingId = null;
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Une erreur est survenue.', 'error');
        this.processingId = null;
      }
    });
  }

  rejeterOffre(id: number): void {
    if (this.processingId) return;
    this.processingId = id;
    this.demandeVolService.rejeter(id).subscribe({
      next: () => {
        this.notifService.show('ℹ️', 'Offre refusée', 'Vous pouvez soumettre une nouvelle demande.', 'info');
        this.processingId = null;
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Une erreur est survenue.', 'error');
        this.processingId = null;
      }
    });
  }

  openPayment(d: DemandeVol): void {
    this.payingDemande = d;
    this.selectedPayMethod = 'ORANGE_MONEY';
    this.payPhone = '';
    this.showPaymentModal = true;
  }

  submitPayment(): void {
    if (!this.payingDemande || this.paySubmitting) return;
    this.paySubmitting = true;
    this.demandeVolService.payer(this.payingDemande.id, {
      modePaiement: this.selectedPayMethod,
      phoneNumber: this.payPhone || undefined
    }).subscribe({
      next: () => {
        this.notifService.show('💳', 'Paiement enregistré !', 'Votre billet sera émis très prochainement.', 'success');
        this.showPaymentModal = false;
        this.paySubmitting = false;
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Erreur lors du paiement.', 'error');
        this.paySubmitting = false;
      }
    });
  }

  get needsPhone(): boolean {
    return ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(this.selectedPayMethod);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';
  }

  formatDateStr(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // =========== Helpers ===========
  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatMonthYear(d: Date): string {
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }
}
