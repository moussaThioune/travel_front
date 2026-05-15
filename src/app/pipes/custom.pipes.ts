import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'frenchDate' })
export class FrenchDatePipe implements PipeTransform {
  transform(value: string | Date, format: 'short' | 'long' | 'full' = 'long'): string {
    if (!value) return '';
    const date = new Date(value);

    const optionsMap: Record<'short' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
      short: { day: 'numeric', month: 'short', year: 'numeric' },
      long: { day: 'numeric', month: 'long', year: 'numeric' },
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };

    const options = optionsMap[format]; // TypeScript sait maintenant que c’est DateTimeFormatOptions

    return date.toLocaleDateString('fr-FR', options);
  }
}

@Pipe({ name: 'euroPrice' })
export class EuroPricePipe implements PipeTransform {
  transform(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
}

@Pipe({ name: 'reservationStatut' })
export class ReservationStatutPipe implements PipeTransform {
  transform(statut: string): { label: string; class: string; icon: string } {
    const map: Record<string, { label: string; class: string; icon: string }> = {
      'EN_ATTENTE': { label: 'En attente', class: 'pending', icon: '⏳' },
      'CONFIRMEE': { label: 'Confirmée', class: 'confirmed', icon: '✅' },
      'PAYEE': { label: 'Payée', class: 'paid', icon: '💳' },
      'ANNULEE': { label: 'Annulée', class: 'cancelled', icon: '❌' }
    };
    return map[statut] || { label: statut, class: 'pending', icon: '❓' };
  }
}

@Pipe({ name: 'voyageCategorie' })
export class VoyageCategoriePipe implements PipeTransform {
  transform(cat: string): { label: string; color: string; icon: string } {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      'COLONIE': { label: 'Colonie',  color: '#e67e22', icon: '☀️' },
      'ZIARRA':  { label: 'Ziarra',   color: '#16a34a', icon: '🕌' },
      'OMRA':    { label: 'Omra',     color: '#c9a84c', icon: '🕋' },
      'HADJ':    { label: 'Hadj',     color: '#1a4b8c', icon: '🌙' },
      'AUTRE':   { label: 'Autre',    color: '#6b7280', icon: '✈️' }
    };
    return map[cat] || { label: cat, color: '#6b7280', icon: '✈️' };
  }
}

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 120, suffix = '...'): string {
    if (!value || value.length <= limit) return value;
    return value.substring(0, limit).trim() + suffix;
  }
}
