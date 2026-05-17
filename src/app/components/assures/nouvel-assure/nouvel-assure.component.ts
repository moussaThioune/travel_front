import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AssureService } from '../../../services/assure.service';
import { NotificationService } from '../../../services/notification.service';
import { AssureRequest, StatutAssure } from '../../../models/models';

@Component({
  selector: 'app-nouvel-assure',
  templateUrl: './nouvel-assure.component.html',
  styleUrls: ['./nouvel-assure.component.scss']
})
export class NouvelAssureComponent {

  saving = false;
  form: AssureRequest = this.emptyForm();

  readonly statuts: StatutAssure[] = ['ACTIF', 'EXPIRE', 'ANNULE', 'VENDU'];
  readonly carburants = ['ESSENCE', 'GAZOLE', 'HYBRIDE', 'ELECTRIQUE'];

  constructor(
    private router: Router,
    private assureService: AssureService,
    private notif: NotificationService
  ) {}

  save(): void {
    if (!this.form.nom?.trim() || !this.form.telephone?.trim() || !this.form.echeance) {
      this.notif.show('⚠️', 'Requis', 'Nom, téléphone et échéance sont obligatoires.', 'warning');
      return;
    }
    this.saving = true;
    this.assureService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.notif.show('✅', 'Assuré créé', '', 'success');
        this.router.navigate(['/assures']);
      },
      error: () => {
        this.saving = false;
        this.notif.show('❌', 'Erreur', 'Impossible de sauvegarder.', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/assures']);
  }

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

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  emptyForm(): AssureRequest {
    return {
      nom: '', prenom: '', marque: '', immatricule: '', puissanceFiscale: '',
      carburant: 'ESSENCE', numeroPolicce: '', montantPrime: undefined,
      echeance: '', dateRappel: '',
      periodeGarantieDebut: '', periodeGarantieAns: undefined,
      telephone: '', telephone2: '', email: '', statut: 'ACTIF', notes: ''
    };
  }
}
