import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type StatutDemande =
  | 'EN_ATTENTE'
  | 'REPONSE_ENVOYEE'
  | 'ACCEPTE'
  | 'REJETE'
  | 'VALIDEE'
  | 'PAYE'
  | 'BILLET_EMIS';

export interface DemandeVolRequest {
  origine: string;
  destination: string;
  dateDepart: string;        // ISO date yyyy-MM-dd
  dateRetour?: string | null;
  typeVoyage: string;
  nbAdultes: number;
  nbEnfants: number;
  nbBebes: number;
  classeVoyage: string;
  volsDirects: boolean;
  aeroportsProximiteOrigine: boolean;
  aeroportsProximiteDestination: boolean;
  notesClient?: string;
}

export interface DemandeVol {
  id: number;
  numeroDemande: string;
  clientNom: string;
  clientEmail: string;
  origine: string;
  destination: string;
  dateDepart: string;
  dateRetour?: string;
  typeVoyage: string;
  nbAdultes: number;
  nbEnfants: number;
  nbBebes: number;
  totalPassagers: number;
  classeVoyage: string;
  volsDirects: boolean;
  notesClient?: string;
  compagnieAerienne?: string;
  prixParPersonne?: number;
  prixTotal?: number;
  dureeVol?: string;
  escales?: string;
  notesAdmin?: string;
  numeroBillet?: string;
  statut: StatutDemande;
  createdAt: string;
  updatedAt: string;
}

export interface ReponseAdminRequest {
  compagnieAerienne: string;
  prixParPersonne: number;
  prixTotal: number;
  dureeVol?: string;
  escales?: string;
  notesAdmin?: string;
}

export interface BilletRequest {
  numeroBillet: string;
  notesAdmin?: string;
}

export type ModePaiement = 'ORANGE_MONEY' | 'WAVE' | 'FREE_MONEY' | 'CARTE_BANCAIRE';

export interface PaiementVolRequest {
  modePaiement: ModePaiement;
  phoneNumber?: string;
  referenceTransaction?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeVolService {
  private readonly API = `${environment.apiUrl}/demandes-vol`;

  private _mesDemandes = signal<DemandeVol[]>([]);
  private _allDemandes = signal<DemandeVol[]>([]);

  readonly mesDemandes = this._mesDemandes.asReadonly();
  readonly allDemandes = this._allDemandes.asReadonly();

  constructor(private http: HttpClient) {}

  // === CLIENT ===

  submit(req: DemandeVolRequest): Observable<DemandeVol> {
    return this.http.post<DemandeVol>(this.API, req).pipe(
      tap(d => this._mesDemandes.update(list => [d, ...list]))
    );
  }

  loadMesDemandes(): void {
    this.http.get<DemandeVol[]>(`${this.API}/mes`).subscribe({
      next: list => this._mesDemandes.set(list),
      error: () => {}
    });
  }

  accepter(id: number): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/accepter`, {}).pipe(
      tap(updated => this._updateInList(updated))
    );
  }

  rejeter(id: number): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/rejeter`, {}).pipe(
      tap(updated => this._updateInList(updated))
    );
  }

  payer(id: number, req: PaiementVolRequest): Observable<DemandeVol> {
    return this.http.post<DemandeVol>(`${this.API}/${id}/paiement`, req).pipe(
      tap(updated => this._updateInList(updated))
    );
  }

  // === ADMIN ===

  loadAll(): void {
    this.http.get<DemandeVol[]>(this.API).subscribe({
      next: list => this._allDemandes.set(list),
      error: () => {}
    });
  }

  repondre(id: number, req: ReponseAdminRequest): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/repondre`, req).pipe(
      tap(updated => this._updateInAllList(updated))
    );
  }

  valider(id: number): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/valider`, {}).pipe(
      tap(updated => this._updateInAllList(updated))
    );
  }

  marquerPaye(id: number): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/marquer-paye`, {}).pipe(
      tap(updated => this._updateInAllList(updated))
    );
  }

  emettreTicket(id: number, req: BilletRequest): Observable<DemandeVol> {
    return this.http.put<DemandeVol>(`${this.API}/${id}/emettre-ticket`, req).pipe(
      tap(updated => this._updateInAllList(updated))
    );
  }

  private _updateInList(updated: DemandeVol): void {
    this._mesDemandes.update(list => list.map(d => d.id === updated.id ? updated : d));
  }

  private _updateInAllList(updated: DemandeVol): void {
    this._allDemandes.update(list => list.map(d => d.id === updated.id ? updated : d));
  }

  statutLabel(s: StatutDemande): string {
    const labels: Record<StatutDemande, string> = {
      EN_ATTENTE: 'En attente',
      REPONSE_ENVOYEE: 'Réponse envoyée',
      ACCEPTE: 'Tarifs acceptés',
      REJETE: 'Rejeté',
      VALIDEE: 'Validée',
      PAYE: 'Payé',
      BILLET_EMIS: 'Billet émis'
    };
    return labels[s] ?? s;
  }

  statutClass(s: StatutDemande): string {
    const classes: Record<StatutDemande, string> = {
      EN_ATTENTE: 'badge-warning',
      REPONSE_ENVOYEE: 'badge-info',
      ACCEPTE: 'badge-teal',
      REJETE: 'badge-danger',
      VALIDEE: 'badge-success',
      PAYE: 'badge-success',
      BILLET_EMIS: 'badge-gold'
    };
    return classes[s] ?? 'badge-secondary';
  }
}
