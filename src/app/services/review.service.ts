import { Injectable, signal, computed } from '@angular/core';

export interface Review {
  id: string;
  nom: string;
  note: number;
  commentaire: string;
  date: string;
  voyage?: string;
}

const STORAGE_KEY = 'vgr_reviews';
const BASE_TRAVELERS = 12000;
const BASE_RATING_SUM = 9800 * 4.9;
const BASE_RATING_COUNT = 9800;

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private _reviews = signal<Review[]>(this.load());

  readonly reviews = this._reviews.asReadonly();

  readonly totalTravelers = computed(() => BASE_TRAVELERS + this._reviews().length);

  readonly averageRating = computed(() => {
    const all = this._reviews();
    if (!all.length) return 4.9;
    const sum = BASE_RATING_SUM + all.reduce((s, r) => s + r.note, 0);
    const count = BASE_RATING_COUNT + all.length;
    return Math.round((sum / count) * 10) / 10;
  });

  submit(data: Omit<Review, 'id' | 'date'>): void {
    const review: Review = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    this._reviews.update(list => [review, ...list]);
    this.save(this._reviews());
  }

  private load(): Review[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private save(reviews: Review[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }
}
