import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { VoyageService } from '../../services/voyage.service';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { Voyage, Destination, VoyageSearchParams } from '../../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredVoyages: Voyage[] = [];
  destinations: Destination[] = [];
  searchParams = {
  destination: '',
  dateDepart: '',
  dateRetour: '',   // ← ajouter
  places: undefined,
  prixMax: undefined
};

  readonly heroImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=90',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2000&q=90',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=2000&q=90'
  ];
  currentHeroImg = 0;
  private heroInterval?: ReturnType<typeof setInterval>;

  private readonly fallbackTestimonials = [
    {
      text: "Un séjour à Bali absolument magique. La réservation en ligne était fluide, les notifications de suivi rassurantes, et le voyage a dépassé toutes nos attentes!",
      name: "Sophie M.", trip: "Bali, Indonésie • Nov. 2024", stars: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', initiale: ''
    },
    {
      text: "Le suivi en temps réel est vraiment rassurant. J'ai reçu chaque notification à temps. Un service professionnel et une agence de confiance, je recommande!",
      name: "Thomas L.", trip: "Safari Kenya • Oct. 2024", stars: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', initiale: ''
    },
    {
      text: "Les Maldives avec Voyageur, c'est une expérience hors du commun. Le processus de réservation est simple et le suivi impeccable!",
      name: "Marie D.", trip: "Maldives • Déc. 2024", stars: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', initiale: ''
    }
  ];

  get testimonials() {
    const reviews = this.reviewService.reviews();
    if (!reviews.length) return this.fallbackTestimonials;
    return reviews.slice(0, 3).map(r => ({
      text: r.commentaire,
      name: r.nom,
      trip: [r.voyage, r.date ? new Date(r.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''].filter(Boolean).join(' • '),
      stars: Math.min(5, Math.max(1, Math.round(r.note / 2))),
      avatar: '',
      initiale: r.nom.charAt(0).toUpperCase()
    }));
  }

  starsArray = (n: number) => Array(n).fill(0);

  constructor(
    private voyageService: VoyageService,
    private mockData: MockDataService,
    public authService: AuthService,
    public reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewService.loadStats();
    this.reviewService.loadReviewsPublic();
    this.featuredVoyages = this.voyageService.activeVoyages().slice(0, 3);
    this.destinations = this.mockData.DESTINATIONS;
    this.heroInterval = setInterval(() => {
      this.currentHeroImg = (this.currentHeroImg + 1) % this.heroImages.length;
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  doSearch(): void {
    const queryParams: Record<string, string> = {};
    if (this.searchParams.destination) queryParams['destination'] = this.searchParams.destination;
    if (this.searchParams.dateDepart) queryParams['dateDepart'] = this.searchParams.dateDepart;
    if (this.searchParams.prixMax) queryParams['prixMax'] = String(this.searchParams.prixMax);
    if (this.searchParams.places) queryParams['places'] = String(this.searchParams.places);
    this.router.navigate(['/voyages'], { queryParams });
  }

  filterByDestination(dest: string): void {
    this.router.navigate(['/voyages'], { queryParams: { destination: dest } });
  }
}