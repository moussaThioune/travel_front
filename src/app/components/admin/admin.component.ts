import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VoyageService } from '../../services/voyage.service';
import { ReservationService } from '../../services/reservation.service';
import { PaiementService } from '../../services/paiement.service';
import { MobileMoneyService } from '../../services/mobile-money.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DemandeVolService, DemandeVol, ReponseAdminRequest, BilletRequest } from '../../services/demande-vol.service';
import { Voyage, Reservation, Paiement, VoyageCreateRequest, ReservationStatut } from '../../models/models';

type AdminTab = 'dashboard' | 'reservations' | 'paiements' | 'mobile_money' | 'voyages' | 'clients' | 'assures' | 'vols';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab: AdminTab = 'dashboard';

  voyages: Voyage[] = [];
  reservations: Reservation[] = [];

  showVoyageForm = false;
  editingVoyage: Voyage | null = null;
  savingVoyage = false;
  form: Partial<VoyageCreateRequest> = this.emptyForm();
  readonly categories = ['COLONIE', 'ZIARRA', 'OMRA', 'HADJ', 'AUTRE'];

  // Upload image
  imagePreview: string = '';
  imageFile: File | null = null;
  imageMode: 'upload' | 'url' = 'upload';

  // Filtres paiements
  filterMode = '';
  filterStatut = '';
  filterSearch = '';

  // Modal rejet
  showRejectModal = false;
  rejectingId = 0;
  rejectReason = '';

  // Modal détail réservation
  selectedReservation: Reservation | null = null;
  showResDetail = false;

  validatingId = 0;
  rejectingActionId = 0;

  // ===== VOLS ADMIN =====
  showRepondreModal = false;
  showBilletModal = false;
  selectedVol: DemandeVol | null = null;
  reponseForm: ReponseAdminRequest = { compagnieAerienne: '', prixParPersonne: 0, prixTotal: 0, dureeVol: '', escales: '', notesAdmin: '' };
  billetForm: BilletRequest = { numeroBillet: '', notesAdmin: '' };
  processingVolId: number | null = null;

  constructor(
    public voyageService: VoyageService,
    public reservationService: ReservationService,
    public paiementService: PaiementService,
    public mmService: MobileMoneyService,
    public authService: AuthService,
    private notifService: NotificationService,
    public demandeVolService: DemandeVolService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/connexion']);
      return;
    }
    // Check if deep-linked to vols tab
    this.route.queryParams.subscribe(p => {
      if (p['tab'] === 'vols') { this.activeTab = 'vols'; this.demandeVolService.loadAll(); }
    });
    this.voyageService.getAll().subscribe({
      next: v => this.voyages = v.slice().reverse(),
      error: () => {}
    });
    this.reservationService.getAllForAdmin().subscribe({
      next: r => this.reservations = r,
      error: () => {}
    });
  }

  // ===== STATS DASHBOARD =====
  get dashStats() {
    const res = this.reservations;
    const pmts = this.paiementService.allPaiements();
    return {
      totalVoyages: this.voyages.length,
      totalReservations: res.length,
      resEnAttente: res.filter(r => r.statut === 'EN_ATTENTE').length,
      resPayees: res.filter(r => r.statut === 'PAYEE').length,
      revenuTotal: pmts.filter(p => p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      pmtEnAttente: pmts.filter(p => p.statut === 'EN_ATTENTE').length,
      orangeMoney: pmts.filter(p => p.modePaiement === 'ORANGE_MONEY' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      wave: pmts.filter(p => p.modePaiement === 'WAVE' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      freeMoney: pmts.filter(p => p.modePaiement === 'FREE_MONEY' && p.statut === 'SUCCES').reduce((s, p) => s + p.montant, 0),
      totalClients: new Set(res.map(r => r.client.email)).size
    };
  }

  // ===== PAIEMENTS FILTRÉS =====
  get filteredPaiements(): Paiement[] {
    let list = this.paiementService.allPaiements();
    if (this.filterMode) list = list.filter(p => p.modePaiement === this.filterMode);
    if (this.filterStatut) list = list.filter(p => p.statut === this.filterStatut);
    if (this.filterSearch) {
      const q = this.filterSearch.toLowerCase();
      list = list.filter(p =>
        p.clientNom.toLowerCase().includes(q) ||
        p.numeroReservation.toLowerCase().includes(q) ||
        p.numeroPaiement.toLowerCase().includes(q) ||
        (p.phoneNumber || '').includes(q)
      );
    }
    return list;
  }

  get mobileMoneyPending(): Paiement[] {
    return this.paiementService.allPaiements().filter(p =>
      ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(p.modePaiement) && p.statut === 'EN_ATTENTE'
    );
  }

  // ===== VALIDATION PAIEMENT =====
  validerPaiement(p: Paiement): void {
    if (this.validatingId) return;
    this.validatingId = p.id;
    this.paiementService.validerPaiement(p.id).subscribe(() => {
      // Mettre à jour la réservation correspondante
      this.reservationService.validateMobilePayment(p.reservationId, p.montant);
      this.reservationService.getAllForAdmin().subscribe(r => this.reservations = r);
      this.validatingId = 0;
      this.notifService.show('✅', 'Paiement validé', `${p.numeroPaiement} — ${p.clientNom}`, 'success');
    });
  }

  openRejectModal(id: number): void {
    this.rejectingId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmerRejet(): void {
    this.rejectingActionId = this.rejectingId;
    this.paiementService.rejeterPaiement(this.rejectingId, this.rejectReason).subscribe(() => {
      this.showRejectModal = false;
      this.rejectingActionId = 0;
    });
  }

  // ===== RÉSERVATIONS =====
  get filteredReservations(): Reservation[] {
    if (!this.filterSearch) return this.reservations;
    const q = this.filterSearch.toLowerCase();
    return this.reservations.filter(r =>
      r.client.firstName.toLowerCase().includes(q) ||
      r.client.lastName.toLowerCase().includes(q) ||
      r.client.email.toLowerCase().includes(q) ||
      r.numeroReservation.toLowerCase().includes(q) ||
      r.voyage.titre.toLowerCase().includes(q)
    );
  }

  openResDetail(res: Reservation): void {
    this.selectedReservation = res;
    this.showResDetail = true;
  }

  updateResStatut(id: number, statut: ReservationStatut): void {
    this.reservationService.updateStatut(id, statut);
    this.reservationService.getAllForAdmin().subscribe(r => this.reservations = r);
    if (this.selectedReservation?.id === id) {
      this.selectedReservation = { ...this.selectedReservation, statut };
    }
    this.notifService.show('📋', 'Statut mis à jour', `Réservation → ${this.statutLabel(statut)}`, 'info');
  }

  getPaiementsForRes(reservationId: number): Paiement[] {
    return this.paiementService.getPaiementsForReservation(reservationId);
  }

  // ===== CLIENTS =====
  get clientsList() {
    const map = new Map<string, { nom: string; email: string; phone?: string; nbRes: number; totalPaye: number }>();
    this.reservations.forEach(r => {
      const key = r.client.email;
      if (!map.has(key)) {
        map.set(key, { nom: `${r.client.firstName} ${r.client.lastName}`, email: r.client.email, phone: r.client.phone, nbRes: 0, totalPaye: 0 });
      }
      const c = map.get(key)!;
      c.nbRes++;
      c.totalPaye += r.montantPaye;
    });
    return Array.from(map.values());
  }

  // ===== VOYAGES CRUD =====
  openCreateForm(): void {
    this.showVoyageForm = true;
    this.editingVoyage = null;
    this.form = this.emptyForm();
    this.imagePreview = '';
    this.imageFile = null;
    this.imageMode = 'upload';
    setTimeout(() => {
      const el = document.querySelector('.admin-form-panel') as HTMLElement;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  editVoyage(v: Voyage): void {
    this.editingVoyage = v;
    this.form = { titre: v.titre, description: v.description, destination: v.destination, paysDestination: v.paysDestination, dateDepart: v.dateDepart, dateRetour: v.dateRetour, prixParPersonne: v.prixParPersonne, nombrePlacesTotal: v.nombrePlacesTotal, categorie: v.categorie, imageUrl: v.imageUrl };
    this.imagePreview = v.imageUrl || '';
    this.imageFile = null;
    this.imageMode = v.imageUrl ? 'url' : 'upload';
    this.showVoyageForm = true;
  }

  cancelForm(): void {
    this.showVoyageForm = false;
    this.editingVoyage = null;
    this.form = this.emptyForm();
    this.imagePreview = '';
    this.imageFile = null;
    this.imageMode = 'upload';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loadImageFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.loadImageFile(file);
  }

  private loadImageFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.notifService.show('⚠️', 'Fichier invalide', 'Veuillez sélectionner une image (JPG, PNG, WebP).', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.notifService.show('⚠️', 'Fichier trop lourd', 'La taille maximale est 5 MB.', 'warning');
      return;
    }
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        this.imagePreview = compressed;
        this.form.imageUrl = compressed;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onUrlChange(url: string): void {
    this.imagePreview = url;
    this.form.imageUrl = url;
  }

  removeImage(): void {
    this.imagePreview = '';
    this.imageFile = null;
    this.form.imageUrl = '';
  }

  saveVoyage(): void {
    if (!this.form.titre || !this.form.destination) { this.notifService.show('⚠️', 'Requis', 'Remplissez les champs obligatoires.', 'warning'); return; }
    this.savingVoyage = true;
    const obs = this.editingVoyage
      ? this.voyageService.update(this.editingVoyage.id, this.form as VoyageCreateRequest)
      : this.voyageService.create(this.form as VoyageCreateRequest);
    obs.subscribe(() => {
      this.voyageService.getAll().subscribe(v => this.voyages = v.slice().reverse());
      this.savingVoyage = false; this.cancelForm();
      this.notifService.show('✅', 'Voyage sauvegardé!', '', 'success');
    });
  }

  deleteVoyage(v: Voyage): void {
    if (!confirm(`Supprimer "${v.titre}"?`)) return;
    this.voyageService.delete(v.id).subscribe(() => {
      this.voyages = this.voyages.filter(x => x.id !== v.id);
      this.notifService.show('🗑️', 'Supprimé', v.titre, 'info');
    });
  }

  emptyForm(): Partial<VoyageCreateRequest> {
    return { titre: '', description: '', destination: '', paysDestination: '', dateDepart: '', dateRetour: '', prixParPersonne: 0, nombrePlacesTotal: 0, categorie: 'OMRA', imageUrl: '' };
  }

  // ===== HELPERS =====
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
  pmtStatutIcon(s: string): string {
    return this.paiementService.getStatutLabel(s as any).icon;
  }
  modeLabel(m: string): string {
    return this.mmService.getLabelForMode(m);
  }
  isMobile(m: string): boolean {
    return ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY'].includes(m);
  }

  allMobileMoneyPaiements() {
    return this.paiementService.allPaiements().filter(p => this.isMobile(p.modePaiement));
  }
  getProvider(id: string) {
    return this.mmService.getProvider(id);
  }
  trackById(i: number, item: any): number { return item.id; }

  // ===== VOLS ADMIN METHODS =====
  get volsDemandes(): DemandeVol[] { return this.demandeVolService.allDemandes(); }

  setActiveTabVols(): void {
    this.activeTab = 'vols';
    this.demandeVolService.loadAll();
  }

  openRepondre(d: DemandeVol): void {
    this.selectedVol = d;
    this.reponseForm = { compagnieAerienne: d.compagnieAerienne ?? '', prixParPersonne: d.prixParPersonne ?? 0, prixTotal: d.prixTotal ?? 0, dureeVol: d.dureeVol ?? '', escales: d.escales ?? '', notesAdmin: d.notesAdmin ?? '' };
    this.showRepondreModal = true;
  }

  submitReponse(): void {
    if (!this.selectedVol || this.processingVolId) return;
    this.processingVolId = this.selectedVol.id;
    this.demandeVolService.repondre(this.selectedVol.id, this.reponseForm).subscribe({
      next: () => { this.notifService.show('✅', 'Réponse envoyée', 'Le client a reçu votre offre par email.', 'success'); this.showRepondreModal = false; this.processingVolId = null; },
      error: () => { this.notifService.show('❌', 'Erreur', 'Impossible d\'envoyer la réponse.', 'error'); this.processingVolId = null; }
    });
  }

  validerVol(d: DemandeVol): void {
    if (this.processingVolId) return;
    this.processingVolId = d.id;
    this.demandeVolService.valider(d.id).subscribe({
      next: () => { this.notifService.show('✅', 'Demande validée', 'Le client est notifié pour le paiement.', 'success'); this.processingVolId = null; },
      error: () => { this.notifService.show('❌', 'Erreur', 'Impossible de valider.', 'error'); this.processingVolId = null; }
    });
  }

  marquerVolPaye(d: DemandeVol): void {
    if (this.processingVolId) return;
    this.processingVolId = d.id;
    this.demandeVolService.marquerPaye(d.id).subscribe({
      next: () => { this.notifService.show('💳', 'Marqué payé', 'Statut mis à jour.', 'success'); this.processingVolId = null; },
      error: () => { this.processingVolId = null; }
    });
  }

  openBillet(d: DemandeVol): void {
    this.selectedVol = d;
    this.billetForm = { numeroBillet: d.numeroBillet ?? '', notesAdmin: '' };
    this.showBilletModal = true;
  }

  submitBillet(): void {
    if (!this.selectedVol || this.processingVolId) return;
    this.processingVolId = this.selectedVol.id;
    this.demandeVolService.emettreTicket(this.selectedVol.id, this.billetForm).subscribe({
      next: () => { this.notifService.show('🎫', 'Billet émis', 'Le client a reçu son billet par email.', 'success'); this.showBilletModal = false; this.processingVolId = null; },
      error: () => { this.notifService.show('❌', 'Erreur', 'Impossible d\'émettre le billet.', 'error'); this.processingVolId = null; }
    });
  }

  volFormatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  volFormatPrice(p: number | undefined): string {
    if (!p) return '—';
    return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';
  }
}
