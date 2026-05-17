import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImportService, ImportResult } from '../../../services/import.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-import-assure',
  templateUrl: './import-assure.component.html',
  styleUrls: ['./import-assure.component.scss']
})
export class ImportAssureComponent {

  importFile: File | null = null;
  importing = false;
  isDragOver = false;
  importResult: ImportResult | null = null;

  readonly excelColumns = [
    { name: 'NOM',        required: true },
    { name: 'PRENOM',     required: false },
    { name: 'MARQUE',     required: false },
    { name: 'IMMAT.',     required: false },
    { name: 'PÉRIODE',    required: false },
    { name: 'ÉCHÉANCE',   required: true },
    { name: 'RAPPEL',     required: false },
    { name: 'TÉLÉPHONE',  required: true },
    { name: 'NOTES',      required: false },
  ];

  constructor(
    private router: Router,
    private importService: ImportService,
    private notif: NotificationService
  ) {}

  goBack(): void {
    this.router.navigate(['/assures']);
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) { this.importFile = file; this.importResult = null; }
  }

  onImportDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) { this.importFile = file; this.importResult = null; }
  }

  doImport(): void {
    if (!this.importFile) return;
    this.importing = true;
    this.importResult = null;
    this.importService.importAssuresExcel(this.importFile).subscribe({
      next: (r) => {
        this.importing = false;
        this.importResult = r;
        this.notif.show('📊', 'Import terminé', `${r.imported} assuré(s) importé(s)`, 'success');
      },
      error: (err) => {
        this.importing = false;
        const msg = err?.error?.error || 'Erreur lors de l\'import.';
        this.notif.show('❌', 'Erreur import', msg, 'error');
      }
    });
  }

  downloadTemplate(): void {
    const header = 'NOM,PRENOM,MARQUE,IMMATRICULE,PERIODE_GARANTIE,ECHEANCE,DATE_RAPPEL,TELEPHONE,NOTES';
    const example = 'NDIAYE,MALICK,FORD,AA-858-PC,1,2026-07-08,2026-07-01,77655 62 43,';
    const blob = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'modele_assures.csv';
    a.click(); URL.revokeObjectURL(url);
  }
}
