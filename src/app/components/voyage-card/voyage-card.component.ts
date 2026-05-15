import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Voyage } from '../../models/models';
import { VoyageService } from '../../services/voyage.service';

@Component({
  selector: 'app-voyage-card',
  templateUrl: './voyage-card.component.html',
  styleUrls: ['./voyage-card.component.scss']
})
export class VoyageCardComponent {
  @Input() voyage!: Voyage;
  @Output() reserveClicked = new EventEmitter<Voyage>();

  constructor(private voyageService: VoyageService, private router: Router) {}

  get availPct(): number {
    return this.voyageService.getAvailabilityPercent(this.voyage);
  }
  get availClass(): string {
    return this.voyageService.getAvailabilityClass(this.voyage);
  }
  get availLabel(): string {
    return this.voyageService.getAvailabilityLabel(this.voyage);
  }

  goToDetail(): void {
    this.router.navigate(['/voyages', this.voyage.id]);
  }

  onReserve(event: Event): void {
    event.stopPropagation();
    this.reserveClicked.emit(this.voyage);
    this.router.navigate(['/voyages', this.voyage.id]);
  }

  starsArray(n: number): number[] { return Array(n).fill(0); }

  get categLabel(): string {
    const map: Record<string, string> = {
      COLONIE: '☀️ Colonie', ZIARRA: '🕌 Ziarra',
      OMRA: '🕋 Omra', HADJ: '🌙 Hadj', AUTRE: '✈️ Autre'
    };
    return map[this.voyage.categorie] || this.voyage.categorie;
  }

  get categColor(): string {
    const map: Record<string, string> = {
      COLONIE: '#e67e22', ZIARRA: '#16a34a',
      OMRA: '#c9a84c', HADJ: '#1a4b8c', AUTRE: '#6b7280'
    };
    return map[this.voyage.categorie] || '#1a4b8c';
  }

  formatPrice(p: number): string {
    if (p >= 1_000_000) {
      const m = p / 1_000_000;
      return m % 1 === 0 ? m + ' M' : m.toFixed(1) + ' M';
    }
    if (p >= 1_000) return Math.round(p / 1_000) + ' K';
    return p.toLocaleString('fr-FR');
  }
}
