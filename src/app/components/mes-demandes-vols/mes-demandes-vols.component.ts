import { Component, OnInit } from '@angular/core';
import { DemandeVolService, DemandeVol } from '../../services/demande-vol.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-mes-demandes-vols',
  templateUrl: './mes-demandes-vols.component.html',
  styleUrls: ['./mes-demandes-vols.component.scss']
})
export class MesDemandesVolsComponent implements OnInit {

  loading = true;
  processingId: number | null = null;
  selectedDemande: DemandeVol | null = null;

  constructor(
    public demandeVolService: DemandeVolService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.demandeVolService.loadMesDemandes();
    setTimeout(() => this.loading = false, 600);
  }

  get demandes(): DemandeVol[] {
    return this.demandeVolService.mesDemandes();
  }

  openDetail(d: DemandeVol): void {
    this.selectedDemande = d;
  }

  closeDetail(): void {
    this.selectedDemande = null;
  }

  accepter(d: DemandeVol): void {
    if (this.processingId) return;
    this.processingId = d.id;
    this.demandeVolService.accepter(d.id).subscribe({
      next: () => {
        this.notifService.show('✅', 'Tarifs acceptés', 'Notre équipe va valider votre réservation.', 'success');
        this.selectedDemande = this.demandes.find(x => x.id === d.id) ?? null;
        this.processingId = null;
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Une erreur est survenue.', 'error');
        this.processingId = null;
      }
    });
  }

  rejeter(d: DemandeVol): void {
    if (this.processingId) return;
    this.processingId = d.id;
    this.demandeVolService.rejeter(d.id).subscribe({
      next: () => {
        this.notifService.show('ℹ️', 'Offre refusée', 'Vous pouvez soumettre une nouvelle demande.', 'info');
        this.selectedDemande = this.demandes.find(x => x.id === d.id) ?? null;
        this.processingId = null;
      },
      error: () => {
        this.notifService.show('❌', 'Erreur', 'Une erreur est survenue.', 'error');
        this.processingId = null;
      }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';
  }
}
