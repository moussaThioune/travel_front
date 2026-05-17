import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssureService } from '../../services/assure.service';
import { NotificationService } from '../../services/notification.service';
import { Assure, AssureRequest, AssureStats, StatutAssure } from '../../models/models';

type AssureTab = 'liste' | 'echeances' | 'expires' | 'stats';
type FormMode = 'none' | 'edit';

@Component({
  selector: 'app-assures',
  templateUrl: './assures.component.html',
  styleUrls: ['./assures.component.scss']
})
export class AssuresComponent implements OnInit {

  activeTab: AssureTab = 'liste';
  assures: Assure[] = [];
  echeances: Assure[] = [];
  expires: Assure[] = [];
  stats: AssureStats | null = null;

  loading = false;
  searchQuery = '';
  filterStatut = '';
  echeanceDays = 30;

  // Pagination
  pageSize = 10;
  currentPage = 1;

  // Formulaire
  formMode: FormMode = 'none';
  editingId: number | null = null;
  saving = false;
  form: AssureRequest = this.emptyForm();

  // Détail / notification
  selectedAssure: Assure | null = null;
  showDetailModal = false;
  showNotifModal = false;
  notifForm = { email: true, sms: true, messagePersonnalise: '' };
  sendingNotif = false;

  readonly statuts: StatutAssure[] = ['ACTIF', 'EXPIRE', 'ANNULE', 'VENDU'];
  readonly carburants = ['ESSENCE', 'GAZOLE', 'HYBRIDE', 'ELECTRIQUE'];

  constructor(
    private router: Router,
    private assureService: AssureService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.assureService.getAll().subscribe({
      next: v => { this.assures = v; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.assureService.getStats().subscribe(s => this.stats = s);
    this.assureService.getEcheancesProches(this.echeanceDays).subscribe(v => this.echeances = v);
    this.assureService.getExpires().subscribe(v => this.expires = v);
  }

  // ===== FILTRES =====
  get filteredAssures(): Assure[] {
    let list = [...this.assures].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a =>
        a.nomComplet.toLowerCase().includes(q) ||
        (a.immatricule || '').toLowerCase().includes(q) ||
        (a.telephone || '').includes(q) ||
        (a.marque || '').toLowerCase().includes(q)
      );
    }
    if (this.filterStatut) list = list.filter(a => a.statut === this.filterStatut);
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssures.length / this.pageSize));
  }

  get paginatedAssures(): Assure[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAssures.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchQuery.trim().length >= 2) {
      this.assureService.search(this.searchQuery).subscribe(v => { this.assures = v; });
    } else if (!this.searchQuery.trim()) {
      this.assureService.getAll().subscribe(v => { this.assures = v; });
    }
  }

  onFilterChange(): void { this.currentPage = 1; }

  // ===== CRUD =====
  openCreate(): void {
    this.router.navigate(['/assures/nouveau']);
  }

  openEdit(a: Assure): void {
    this.form = {
      nom: a.nom, prenom: a.prenom || '', marque: a.marque || '',
      immatricule: a.immatricule || '', puissanceFiscale: a.puissanceFiscale || '',
      carburant: a.carburant || '', numeroPolicce: a.numeroPolicce || '',
      montantPrime: a.montantPrime,
      echeance: a.echeance, dateRappel: a.dateRappel || '',
      periodeGarantieDebut: a.periodeGarantieDebut || '',
      periodeGarantieAns: a.periodeGarantieAns,
      telephone: a.telephone, telephone2: a.telephone2 || '',
      email: a.email || '', statut: a.statut, notes: a.notes || ''
    };
    this.editingId = a.id;
    this.formMode = 'edit';
    this.showDetailModal = false;
  }

  save(): void {
    if (!this.form.nom?.trim() || !this.form.telephone?.trim() || !this.form.echeance) {
      this.notif.show('⚠️', 'Requis', 'Nom, téléphone et échéance sont obligatoires.', 'warning');
      return;
    }
    this.saving = true;
    const obs = this.assureService.update(this.editingId!, this.form);
    obs.subscribe({
      next: () => {
        this.saving = false; this.formMode = 'none';
        this.loadAll();
        this.notif.show('✅', 'Assuré modifié', '', 'success');
      },
      error: () => { this.saving = false; this.notif.show('❌', 'Erreur', 'Impossible de sauvegarder.', 'error'); }
    });
  }

  cancelForm(): void { this.formMode = 'none'; this.editingId = null; }

  delete(a: Assure): void {
    if (!confirm(`Supprimer ${a.nomComplet} (${a.immatricule || '—'}) ?`)) return;
    this.assureService.delete(a.id).subscribe({
      next: () => { this.loadAll(); this.notif.show('🗑️', 'Supprimé', a.nomComplet, 'info'); },
      error: () => this.notif.show('❌', 'Erreur', 'Impossible de supprimer.', 'error')
    });
  }

  // ===== DÉTAIL =====
  openDetail(a: Assure): void {
    this.assureService.getById(a.id).subscribe(full => {
      this.selectedAssure = full;
      this.showDetailModal = true;
    });
  }

  closeDetail(): void { this.showDetailModal = false; this.selectedAssure = null; }

  // ===== NOTIFICATIONS =====
  openNotif(a: Assure): void {
    this.selectedAssure = a;
    this.notifForm = { email: !!a.email, sms: true, messagePersonnalise: '' };
    this.showNotifModal = true;
  }

  sendNotif(): void {
    if (!this.selectedAssure) return;
    this.sendingNotif = true;
    this.assureService.notifier(this.selectedAssure.id, this.notifForm).subscribe({
      next: r => {
        this.sendingNotif = false; this.showNotifModal = false;
        this.notif.show('📬', 'Envoyé', r.message, 'success');
      },
      error: () => { this.sendingNotif = false; this.notif.show('❌', 'Erreur envoi', '', 'error'); }
    });
  }

  lancerRappels(): void {
    if (!confirm('Lancer les rappels pour tous les assurés à relancer ?')) return;
    this.assureService.lancerRappels().subscribe({
      next: r => this.notif.show('🚀', 'Job lancé', r.message, 'success'),
      error: () => this.notif.show('❌', 'Erreur', 'Impossible de lancer le job.', 'error')
    });
  }

  onEcheanceDaysChange(): void {
    this.assureService.getEcheancesProches(this.echeanceDays).subscribe(v => this.echeances = v);
  }

  // ===== HELPERS =====
  emptyForm(): AssureRequest {
    return {
      nom: '', prenom: '', marque: '', immatricule: '', puissanceFiscale: '',
      carburant: 'ESSENCE', numeroPolicce: '', montantPrime: undefined,
      echeance: '', dateRappel: '',
      periodeGarantieDebut: '', periodeGarantieAns: undefined,
      telephone: '', telephone2: '', email: '', statut: 'ACTIF', notes: ''
    };
  }

  // Calcule automatiquement l'échéance à partir de la date de début et du nombre d'années
  calculerEcheanceAuto(): void {
    const debut = this.form.periodeGarantieDebut;
    const ans = this.form.periodeGarantieAns;
    if (!debut || !ans || ans <= 0) return;
    const d = new Date(debut);
    d.setFullYear(d.getFullYear() + ans);
    d.setDate(d.getDate() - 1);
    this.form.echeance = d.toISOString().split('T')[0];
    const rappel = new Date(d);
    rappel.setDate(rappel.getDate() - 7);
    this.form.dateRappel = rappel.toISOString().split('T')[0];
  }

  statutClass(s: StatutAssure): string {
    return { ACTIF: 'actif', EXPIRE: 'expire', ANNULE: 'annule', VENDU: 'vendu' }[s] || '';
  }

  joursClass(a: Assure): string {
    if (a.expire) return 'rouge';
    if (a.joursRestants <= 7) return 'rouge';
    if (a.joursRestants <= 30) return 'orange';
    return 'vert';
  }

  joursLabel(a: Assure): string {
    if (a.expire) return 'EXPIRÉ';
    if (a.joursRestants === 0) return 'Aujourd\'hui';
    return `J-${a.joursRestants}`;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR');
  }

  trackById(_: number, a: Assure): number { return a.id; }
}
