import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Voyage, VoyageSearchParams, VoyageCreateRequest, VoyageStatut } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VoyageService {
  private readonly API = `${environment.apiUrl}/voyages`;

  private _voyages = signal<Voyage[]>([]);
  readonly voyages = this._voyages.asReadonly();
  readonly activeVoyages = computed(() => this._voyages().filter(v => v.statut === 'ACTIF'));
  readonly featuredVoyages = computed(() => this._voyages().filter(v => v.statut === 'ACTIF').slice(0, 3));

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this._loading.set(true);
    this.http.get<Voyage[]>(this.API).subscribe({
      next: voyages => { this._voyages.set(voyages); this._loading.set(false); },
      error: () => this._loading.set(false)
    });
  }

  getAll(): Observable<Voyage[]> {
    this._loading.set(true);
    return this.http.get<Voyage[]>(this.API).pipe(
      tap(voyages => { this._voyages.set(voyages); this._loading.set(false); }),
      catchError(err => { this._loading.set(false); return throwError(() => err); })
    );
  }

  getAvailable(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.API}/available`);
  }

  getById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.API}/${id}`);
  }

  search(params: VoyageSearchParams): Observable<Voyage[]> {
    let httpParams = new HttpParams();
    if (params.destination) httpParams = httpParams.set('destination', params.destination);
    if (params.dateDepart) httpParams = httpParams.set('dateDepart', params.dateDepart);
    if (params.prixMax != null) httpParams = httpParams.set('prixMax', String(params.prixMax));
    if (params.places != null) httpParams = httpParams.set('places', String(params.places));
    return this.http.get<Voyage[]>(`${this.API}/search`, { params: httpParams });
  }

  create(req: VoyageCreateRequest): Observable<Voyage> {
    return this.http.post<Voyage>(this.API, req).pipe(
      tap(newVoyage => this._voyages.update(v => [newVoyage, ...v]))
    );
  }

  update(id: number, req: Partial<VoyageCreateRequest>): Observable<Voyage> {
    return this.http.put<Voyage>(`${this.API}/${id}`, req).pipe(
      tap(updated => this._voyages.update(voyages =>
        voyages.map(v => v.id === id ? updated : v)
      ))
    );
  }

  updateStatus(id: number, statut: VoyageStatut): Observable<Voyage> {
    return this.http.patch<Voyage>(`${this.API}/${id}/statut`, null, { params: { statut } }).pipe(
      tap(updated => this._voyages.update(voyages =>
        voyages.map(v => v.id === id ? updated : v)
      ))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      tap(() => this._voyages.update(v => v.filter(v => v.id !== id)))
    );
  }

  reduceAvailability(voyageId: number, nbPersons: number): void {
    this._voyages.update(voyages =>
      voyages.map(v => {
        if (v.id !== voyageId) return v;
        const newDispo = v.nombrePlacesDisponibles - nbPersons;
        return {
          ...v,
          nombrePlacesDisponibles: newDispo,
          statut: newDispo === 0 ? 'COMPLET' as VoyageStatut : v.statut
        };
      })
    );
  }

  getAvailabilityPercent(voyage: Voyage): number {
    return Math.round((voyage.nombrePlacesDisponibles / voyage.nombrePlacesTotal) * 100);
  }

  getAvailabilityClass(voyage: Voyage): 'high' | 'medium' | 'low' {
    const pct = this.getAvailabilityPercent(voyage);
    if (pct > 50) return 'high';
    if (pct > 20) return 'medium';
    return 'low';
  }

  getAvailabilityLabel(voyage: Voyage): string {
    const d = voyage.nombrePlacesDisponibles;
    if (d === 0) return 'Complet';
    if (d <= 2) return `⚡ Plus que ${d} place${d > 1 ? 's' : ''}!`;
    if (d <= 6) return `${d} places restantes`;
    return `${d} places disponibles`;
  }
}
