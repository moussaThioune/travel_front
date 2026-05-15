import { Injectable } from '@angular/core';
import { Voyage, Destination } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  get VOYAGES(): Voyage[] { return this.getMockVoyages(); }

  get DESTINATIONS(): Destination[] {
    return [
      { name: 'La Mecque', country: 'Arabie Saoudite', region: 'Moyen-Orient', imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800', minPrice: 2750000, voyagesCount: 2, tag: 'Omra & Hadj', featured: true },
      { name: 'Médine', country: 'Arabie Saoudite', region: 'Moyen-Orient', imageUrl: 'https://images.unsplash.com/photo-1537621547307-9b9f3b4b7e5f?w=800', minPrice: 2750000, voyagesCount: 2, tag: 'Lieux Saints', featured: true },
      { name: 'Fès', country: 'Maroc', region: 'Afrique du Nord', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800', minPrice: 800000, voyagesCount: 1, tag: 'Ziarra', featured: true },
      { name: 'Cap Skirring', country: 'Sénégal', region: 'Afrique de l\'Ouest', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', minPrice: 850000, voyagesCount: 1, tag: 'Colonie', featured: false },
      { name: 'Maroc', country: 'Maroc', region: 'Afrique du Nord', imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', minPrice: 1200000, voyagesCount: 1, tag: 'Colonie', featured: false },
    ];
  }

  getMockVoyages(): Voyage[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1, titre: 'Omra Ramadan 2026 — Package Éco',
        description: 'Vivez les 15 derniers jours du Ramadan à La Mecque. Visa, billet A/R, hébergement, restauration, guidage religieux inclus.',
        destination: 'La Mecque / Médine', paysDestination: 'Arabie Saoudite',
        dateDepart: '2026-03-05', dateRetour: '2026-03-19',
        prixParPersonne: 2750000, nombrePlacesTotal: 50, nombrePlacesDisponibles: 20,
        imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200',
        categorie: 'OMRA', statut: 'ACTIF', dureeJours: 14
      } as Voyage,
      {
        id: 2, titre: 'Hajj 2026 — Package Prestige 17 Jours',
        description: 'Le voyage spirituel de votre vie. En partenariat avec Groupe UNACOIS JAPPO. Encadrement religieux, hébergement VIP.',
        destination: 'La Mecque / Médine', paysDestination: 'Arabie Saoudite',
        dateDepart: '2026-06-01', dateRetour: '2026-06-17',
        prixParPersonne: 6000000, nombrePlacesTotal: 40, nombrePlacesDisponibles: 15,
        imageUrl: 'https://images.unsplash.com/photo-1537621547307-9b9f3b4b7e5f?w=1200',
        categorie: 'HADJ', statut: 'ACTIF', dureeJours: 17
      } as Voyage,
      {
        id: 3, titre: 'Ziarra Fès — 13 au 20 Février',
        description: 'Voyage spirituel à Fès. Billet, hébergement, restauration, transport, Salats, Wazifa, Hadratul Jummah inclus.',
        destination: 'Fès', paysDestination: 'Maroc',
        dateDepart: '2026-02-13', dateRetour: '2026-02-20',
        prixParPersonne: 800000, nombrePlacesTotal: 30, nombrePlacesDisponibles: 12,
        imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200',
        categorie: 'ZIARRA', statut: 'ACTIF', dureeJours: 7
      } as Voyage,
      {
        id: 4, titre: 'Colonie de Vacances — Cap Skirring 2026',
        description: 'Colonie de vacances pour enfants à Cap Skirring. Du 20 Juillet au 4 Août. Plage, activités et encadrement.',
        destination: 'Cap Skirring', paysDestination: 'Sénégal',
        dateDepart: '2026-07-20', dateRetour: '2026-08-04',
        prixParPersonne: 850000, nombrePlacesTotal: 40, nombrePlacesDisponibles: 28,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
        categorie: 'COLONIE', statut: 'ACTIF', dureeJours: 15
      } as Voyage,
    ];
  }
}