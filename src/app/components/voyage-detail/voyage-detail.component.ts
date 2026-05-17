import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Voyage, ReservationRequest, MobileMoneyProvider } from '../../models/models';
import { VoyageService } from '../../services/voyage.service';
import { ReservationService } from '../../services/reservation.service';
import { PaiementService } from '../../services/paiement.service';
import { MobileMoneyService } from '../../services/mobile-money.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

type PayMethod = 'card' | 'paypal' | 'virement' | 'orange_money' | 'wave' | 'free_money';
type BookingStep = 1 | 2 | 3 | 4;

interface PassengerType {
  code: string;
  label: string;
  min: number;
}

@Component({
  selector: 'app-voyage-detail',
  templateUrl: './voyage-detail.component.html',
  styleUrls: ['./voyage-detail.component.scss']
})
export class VoyageDetailComponent implements OnInit {
  voyage: Voyage | null = null;
  loading = true;
  bookingStep: BookingStep = 1;
  processing = false;
  bookingRef = '';
  currentReservationId = 0;

  // Step 1 — passenger types
  readonly passengerTypes: PassengerType[] = [
    { code: 'ADT', label: 'Adulte',                  min: 1 },
    { code: 'CNN', label: 'Enfant accompagné',        min: 0 },
    { code: 'INF', label: 'Bébé sans siège',          min: 0 },
    { code: 'INS', label: 'Bébé avec siège',          min: 0 },
    { code: 'SRC', label: 'Retraité',                 min: 0 },
    { code: 'CMP', label: 'Accompagnateur de voyage', min: 0 },
    { code: 'STU', label: 'Étudiant',                 min: 0 },
  ];

  passengers: Record<string, number> = { ADT: 1, CNN: 0, INF: 0, INS: 0, SRC: 0, CMP: 0, STU: 0 };
  showPassengerDropdown = false;

  typeHebergement = 'standard';
  passportNumber = '';
  notes = '';

  get nbPersonnes(): number {
    return Object.values(this.passengers).reduce((s, n) => s + n, 0);
  }

  get activePassengerTypes(): PassengerType[] {
    return this.passengerTypes.filter(t => this.passengers[t.code] > 0);
  }

  get addablePassengerTypes(): PassengerType[] {
    return this.passengerTypes.filter(t => this.passengers[t.code] === 0);
  }

  get passengersLabel(): string {
    return this.activePassengerTypes
      .map(t => `${this.passengers[t.code]} ${t.code}`)
      .join(' · ');
  }

  increment(code: string): void {
    const max = this.voyage?.nombrePlacesDisponibles ?? 99;
    if (this.nbPersonnes < max) this.passengers[code]++;
  }

  decrement(code: string): void {
    const type = this.passengerTypes.find(t => t.code === code)!;
    if (this.passengers[code] > type.min) this.passengers[code]--;
  }

  addPassengerType(code: string): void {
    this.passengers[code] = 1;
    this.showPassengerDropdown = false;
  }

  removePassengerType(code: string): void {
    this.passengers[code] = 0;
  }

  // Step 3 - payment
  payMethod: PayMethod = 'orange_money';
  cardNumber = ''; cardExpiry = ''; cardCVV = ''; cardHolder = '';
  mobilePhone = '';
  otpSent = false;
  otpCode = '';
  otpGenerated = '';
  otpVerified = false;
  otpError = '';
  sendingOTP = false;

  readonly mobileProviders: MobileMoneyProvider[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voyageService: VoyageService,
    private reservationService: ReservationService,
    private paiementService: PaiementService,
    public mmService: MobileMoneyService,
    public authService: AuthService,
    private notif: NotificationService
  ) {
    this.mobileProviders = this.mmService.PROVIDERS;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.voyageService.getById(id).subscribe({
      next: v => {
        this.voyage = v;
        this.loading = false;
        this.restorePendingBooking(v.id);
      },
      error: () => { this.loading = false; this.router.navigate(['/voyages']); }
    });
  }

  private restorePendingBooking(voyageId: number): void {
    if (!this.authService.isLoggedIn()) return;
    const pending = this.authService.getPendingBooking();
    if (!pending || pending.voyageId !== voyageId) return;

    this.passengers['ADT'] = pending.nbPersonnes;
    this.typeHebergement = pending.typeHebergement;
    this.passportNumber = pending.passportNumber;
    this.notes = pending.notes;
    this.authService.clearPendingBooking();

    this.bookingStep = 1;
    this.notif.show('✈️', 'Réservation restaurée', 'Votre sélection a été conservée. Continuez votre réservation!', 'success');
    setTimeout(() => document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }

  get totalPrice(): number {
    if (!this.voyage) return 0;
    const base = this.nbPersonnes * this.voyage.prixParPersonne;
    if (this.typeHebergement === 'suite') return Math.round(base * 1.2);
    if (this.typeHebergement === 'superieure') return Math.round(base * 1.1);
    return base;
  }

  get availPct(): number { return this.voyage ? this.voyageService.getAvailabilityPercent(this.voyage) : 0; }
  get availClass(): string { return this.voyage ? this.voyageService.getAvailabilityClass(this.voyage) : 'high'; }
  get availLabel(): string { return this.voyage ? this.voyageService.getAvailabilityLabel(this.voyage) : ''; }

  get isMobileMoney(): boolean { return ['orange_money', 'wave', 'free_money'].includes(this.payMethod); }

  selectPayMethod(id: string): void {
    this.payMethod = id.toLowerCase() as PayMethod;
    this.otpSent = false;
    this.otpVerified = false;
    this.otpCode = '';
    this.otpError = '';
  }

  get activeProvider(): MobileMoneyProvider | undefined {
    const map: Record<string, string> = { orange_money: 'ORANGE_MONEY', wave: 'WAVE', free_money: 'FREE_MONEY' };
    return this.mmService.getProvider(map[this.payMethod]);
  }

  get modeForService(): string {
    const map: Record<string, string> = {
      card: 'CARTE_BANCAIRE', paypal: 'PAYPAL', virement: 'VIREMENT',
      orange_money: 'ORANGE_MONEY', wave: 'WAVE', free_money: 'FREE_MONEY'
    };
    return map[this.payMethod] || 'CARTE_BANCAIRE';
  }

  startBooking(): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.savePendingBooking({
        voyageId: this.voyage!.id,
        voyageTitre: this.voyage!.titre,
        nbPersonnes: this.nbPersonnes,
        typeHebergement: this.typeHebergement,
        passportNumber: this.passportNumber,
        notes: this.notes,
        returnUrl: `/voyages/${this.voyage!.id}`
      });
      this.notif.show('🔒', 'Compte requis', 'Créez un compte pour finaliser votre réservation. Vos sélections sont sauvegardées!', 'warning');
      this.router.navigate(['/inscription']);
      return;
    }
    this.bookingStep = 1;
    setTimeout(() => document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  goStep(step: BookingStep): void {
    if (step >= 2 && !this.authService.isLoggedIn()) {
      this.authService.savePendingBooking({
        voyageId: this.voyage!.id,
        voyageTitre: this.voyage!.titre,
        nbPersonnes: this.nbPersonnes,
        typeHebergement: this.typeHebergement,
        passportNumber: this.passportNumber,
        notes: this.notes,
        returnUrl: `/voyages/${this.voyage!.id}`
      });
      this.notif.show('🔒', 'Compte requis', 'Créez un compte pour finaliser. Vos données sont sauvegardées!', 'warning');
      this.router.navigate(['/inscription']);
      return;
    }
    this.bookingStep = step;
    if (step === 3) { this.resetPaymentState(); }
  }

  resetPaymentState(): void {
    this.otpSent = false; this.otpCode = ''; this.otpVerified = false;
    this.otpError = ''; this.otpGenerated = ''; this.mobilePhone = '';
  }

  // ===== OTP pour Mobile Money =====
  sendOTP(): void {
    if (!this.mobilePhone || this.mobilePhone.replace(/\D/g, '').length < 8) {
      this.notif.show('⚠️', 'Numéro invalide', 'Entrez un numéro de téléphone valide.', 'warning');
      return;
    }
    this.sendingOTP = true;
    this.otpGenerated = this.mmService.generateOTP();
    setTimeout(() => {
      this.sendingOTP = false;
      this.otpSent = true;
      this.otpError = '';
      const provider = this.activeProvider;
      this.notif.show(
        provider?.emoji || '📱',
        'Code envoyé!',
        `Un code à 6 chiffres a été envoyé au ${this.mobilePhone}. (Demo: ${this.otpGenerated})`,
        'success'
      );
    }, 1500);
  }

  verifyOTP(): void {
    if (this.otpCode === this.otpGenerated) {
      this.otpVerified = true;
      this.otpError = '';
      this.notif.show('✅', 'Code vérifié!', 'Votre identité est confirmée.', 'success');
    } else {
      this.otpError = 'Code incorrect. Vérifiez le code reçu.';
    }
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.mmService.formatPhone(input.value);
    this.mobilePhone = input.value;
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
    this.cardNumber = input.value;
  }

  canProceedPayment(): boolean {
    if (this.isMobileMoney) return this.otpVerified;
    if (this.payMethod === 'card') return this.cardNumber.replace(/\s/g, '').length >= 16;
    return true;
  }

  processPayment(): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.savePendingBooking({
        voyageId: this.voyage!.id,
        voyageTitre: this.voyage!.titre,
        nbPersonnes: this.nbPersonnes,
        typeHebergement: this.typeHebergement,
        passportNumber: this.passportNumber,
        notes: this.notes,
        returnUrl: `/voyages/${this.voyage!.id}`
      });
      this.notif.show('🔒', 'Compte requis', 'Créez un compte pour finaliser votre réservation.', 'warning');
      this.router.navigate(['/inscription']);
      return;
    }
    if (!this.canProceedPayment()) {
      if (this.isMobileMoney && !this.otpSent) this.notif.show('⚠️', 'OTP requis', 'Envoyez et vérifiez le code OTP d\'abord.', 'warning');
      else if (this.isMobileMoney && !this.otpVerified) this.notif.show('⚠️', 'Code non vérifié', 'Vérifiez le code OTP reçu.', 'warning');
      else if (this.payMethod === 'card') this.notif.show('⚠️', 'Carte incomplète', 'Vérifiez les données de votre carte.', 'warning');
      return;
    }
    this.processing = true;

    const req: ReservationRequest = {
      voyageId: this.voyage!.id,
      nombrePersonnes: this.nbPersonnes,
      typeHebergement: this.typeHebergement,
      passportNumber: this.passportNumber,
      notes: this.notes
    };

    this.reservationService.create(req).subscribe({
      next: res => {
        this.bookingRef = res.numeroReservation;
        this.currentReservationId = res.id;

        // Enregistrer le paiement
        const user = this.authService.currentUser()!;
        this.paiementService.createPaiement(
          {
            reservationId: res.id,
            montant: this.totalPrice,
            modePaiement: this.modeForService as any,
            phoneNumber: this.mobilePhone || undefined,
            referenceTransaction: this.mmService.generateRef(this.modeForService)
          },
          `${user.firstName} ${user.lastName}`,
          user.email,
          this.voyage!.titre,
          this.voyage!.destination,
          res.numeroReservation
        ).subscribe(p => {
          this.processing = false;
          // Si paiement instantané (carte, virement), marquer directement payé
          if (!this.isMobileMoney) {
            this.reservationService.markPaid(res.id, this.totalPrice);
          }
          this.bookingStep = 4;
        });
      },
      error: err => {
        this.processing = false;
        this.notif.show('❌', 'Erreur', err.message || 'Une erreur est survenue.', 'error');
      }
    });
  }

  goToReservations(): void { this.router.navigate(['/mes-reservations']); }
  starsArray(n: number): number[] { return Array(n).fill(0); }
}
