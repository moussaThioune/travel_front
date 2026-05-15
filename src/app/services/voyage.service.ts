import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Voyage, VoyageSearchParams, VoyageCreateRequest, VoyageStatut } from '../models/models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class VoyageService {
  private _voyages = signal<Voyage[]>([]);
  readonly voyages = this._voyages.asReadonly();
  readonly activeVoyages = computed(() => this._voyages().filter(v => v.statut === 'ACTIF'));
  readonly featuredVoyages = computed(() => this._voyages().filter(v => v.statut === 'ACTIF').slice(0, 3));

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  constructor(private mockData: MockDataService) {
    this._voyages.set(this.mockData.VOYAGES);
  }

  getAll(): Observable<Voyage[]> {
    this._loading.set(true);
    return of(this._voyages()).pipe(
      delay(400),
      map(v => { this._loading.set(false); return v; })
    );
  }

  getAvailable(): Observable<Voyage[]> {
    return of(this.activeVoyages()).pipe(delay(300));
  }

  getById(id: number): Observable<Voyage> {
    const voyage = this._voyages().find(v => v.id === id);
    if (!voyage) return throwError(() => ({ message: 'Voyage non trouvé' }));
    return of(voyage).pipe(delay(250));
  }

  search(params: VoyageSearchParams): Observable<Voyage[]> {
    let result = this.activeVoyages();
    if (params.destination) {
      const d = params.destination.toLowerCase();
      result = result.filter(v =>
        v.destination.toLowerCase().includes(d) ||
        v.paysDestination.toLowerCase().includes(d) ||
        v.titre.toLowerCase().includes(d)
      );
    }
    if (params.dateDepart) {
      result = result.filter(v => v.dateDepart >= params.dateDepart!);
    }
    if (params.prixMax) {
      result = result.filter(v => v.prixParPersonne <= params.prixMax!);
    }
    if (params.places) {
      result = result.filter(v => v.nombrePlacesDisponibles >= params.places!);
    }
    if (params.categorie) {
      result = result.filter(v => v.categorie === params.categorie);
    }
    return of(result).pipe(delay(300));
  }

create(req: VoyageCreateRequest): Observable<Voyage> {
  const newVoyage: Voyage = {
    ...req,
    id: Date.now(),
    statut: 'ACTIF',
    nombrePlacesDisponibles: req.nombrePlacesTotal,
    dureeJours: this.calcDuration(req.dateDepart, req.dateRetour),
    imageUrl: req.imageUrl ?? 'assets/default-image.jpg'  // valeur par défaut
  };
  this._voyages.update(v => [newVoyage, ...v]);
  return of(newVoyage).pipe(delay(500));
}

  update(id: number, req: Partial<VoyageCreateRequest>): Observable<Voyage> {
    this._voyages.update(voyages =>
      voyages.map(v => v.id === id ? { ...v, ...req } : v)
    );
    return of(this._voyages().find(v => v.id === id)!).pipe(delay(400));
  }

  updateStatus(id: number, statut: VoyageStatut): Observable<Voyage> {
    this._voyages.update(voyages =>
      voyages.map(v => v.id === id ? { ...v, statut } : v)
    );
    return of(this._voyages().find(v => v.id === id)!).pipe(delay(300));
  }

  delete(id: number): Observable<void> {
    this._voyages.update(v => v.filter(v => v.id !== id));
    return of(undefined).pipe(delay(400));
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

  private calcDuration(dateDepart: string, dateRetour: string): number {
    const d1 = new Date(dateDepart);
    const d2 = new Date(dateRetour);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }
}
