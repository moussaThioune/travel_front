import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id?: number;
  nom: string;
  voyage?: string;
  note: number;
  commentaire: string;
  date?: string;
}

export interface AvisStats {
  totalTravelers: number;
  averageRating: number;
  totalAvis: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = `${environment.apiUrl}/avis`;

  private _reviews = signal<Review[]>([]);
  private _stats = signal<AvisStats>({ totalTravelers: 12000, averageRating: 4.9, totalAvis: 0 });

  readonly reviews = this._reviews.asReadonly();
  readonly totalTravelers = () => this._stats().totalTravelers;
  readonly averageRating = () => this._stats().averageRating;

  constructor(private http: HttpClient) {
    this.loadStats();
    this.loadReviews();
  }

  private loadReviews(): void {
    this.http.get<Review[]>(this.API).subscribe({
      next: reviews => this._reviews.set(reviews),
      error: () => {}
    });
  }

  private loadStats(): void {
    this.http.get<AvisStats>(`${this.API}/stats`).subscribe({
      next: stats => this._stats.set(stats),
      error: () => {}
    });
  }

  submit(data: Omit<Review, 'id' | 'date'>): Observable<Review> {
    return this.http.post<Review>(this.API, data).pipe(
      tap(created => {
        this._reviews.update(list => [created, ...list]);
        this._stats.update(s => ({
          totalTravelers: s.totalTravelers + 1,
          totalAvis: s.totalAvis + 1,
          averageRating: Math.round(
            ((s.averageRating * (s.totalAvis + 9800) + created.note) / (s.totalAvis + 9801)) * 10
          ) / 10
        }));
      })
    );
  }
}
