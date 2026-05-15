import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Voyage, VoyageSearchParams, VoyageCategorie } from '../../models/models';
import { VoyageService } from '../../services/voyage.service';

@Component({
  selector: 'app-voyages',
  templateUrl: './voyages.component.html',
  styleUrls: ['./voyages.component.scss']
})
export class VoyagesComponent implements OnInit {
  voyages: Voyage[] = [];
  filteredVoyages: Voyage[] = [];
  loading = false;

  searchParams: VoyageSearchParams = {};
  sortBy = 'date';
  viewMode: 'grid' | 'list' = 'grid';

  readonly categories: { value: VoyageCategorie | ''; label: string; icon: string; color: string }[] = [
    { value: '',         label: 'Tous',      icon: '🌍',  color: '#1a4b8c' },
    { value: 'COLONIE',  label: 'Colonies',  icon: '☀️',  color: '#e67e22' },
    { value: 'ZIARRA',   label: 'Ziarras',   icon: '🕌',  color: '#16a34a' },
    { value: 'OMRA',     label: 'Omra',      icon: '🕋',  color: '#c9a84c' },
    { value: 'HADJ',     label: 'Hadj',      icon: '🌙',  color: '#1a4b8c' },
    { value: 'AUTRE',    label: 'Autres',    icon: '✈️',  color: '#6b7280' },
  ];
  selectedCategory: VoyageCategorie | '' = '';

  constructor(private voyageService: VoyageService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['destination'])  this.searchParams.destination = params['destination'];
      if (params['dateDepart'])   this.searchParams.dateDepart  = params['dateDepart'];
      if (params['prixMax'])      this.searchParams.prixMax     = +params['prixMax'];
      if (params['places'])       this.searchParams.places      = +params['places'];
      if (params['categorie'])    this.selectedCategory         = params['categorie'];
      this.loadAndFilter();
    });
  }

  loadAndFilter(): void {
    this.loading = true;
    this.voyageService.getAvailable().subscribe(data => {
      this.voyages = data;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.voyages];
    if (this.searchParams.destination) {
      const q = this.searchParams.destination.toLowerCase();
      result = result.filter(v =>
        v.destination.toLowerCase().includes(q) ||
        v.paysDestination.toLowerCase().includes(q) ||
        v.titre.toLowerCase().includes(q)
      );
    }
    if (this.searchParams.dateDepart)
      result = result.filter(v => v.dateDepart >= this.searchParams.dateDepart!);
    if (this.searchParams.prixMax)
      result = result.filter(v => v.prixParPersonne <= this.searchParams.prixMax!);
    if (this.searchParams.places)
      result = result.filter(v => v.nombrePlacesDisponibles >= this.searchParams.places!);
    if (this.selectedCategory)
      result = result.filter(v => v.categorie === this.selectedCategory);
    this.filteredVoyages = this.sortVoyages(result);
  }

  sortVoyages(list: Voyage[]): Voyage[] {
    return [...list].sort((a, b) => {
      switch (this.sortBy) {
        case 'price_asc':  return a.prixParPersonne - b.prixParPersonne;
        case 'price_desc': return b.prixParPersonne - a.prixParPersonne;
        case 'places':     return b.nombrePlacesDisponibles - a.nombrePlacesDisponibles;
        case 'duration':   return b.dureeJours - a.dureeJours;
        default:           return a.dateDepart.localeCompare(b.dateDepart);
      }
    });
  }

  onCategoryChange(cat: VoyageCategorie | ''): void {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  onSortChange(): void { this.applyFilters(); }

  resetFilters(): void {
    this.searchParams = {};
    this.selectedCategory = '';
    this.sortBy = 'date';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchParams.destination || this.searchParams.dateDepart ||
              this.searchParams.prixMax || this.searchParams.places || this.selectedCategory);
  }

  trackById(_: number, v: Voyage): number { return v.id; }

  catColor(cat: string): string {
    const found = this.categories.find(c => c.value === cat);
    return found?.color || '#1a4b8c';
  }

  formatPrice(p: number): string {
    if (p >= 1000000) return (p / 1000000).toFixed(1).replace('.0','') + ' M FCFA';
    if (p >= 1000)    return (p / 1000).toFixed(0) + ' K FCFA';
    return p + ' FCFA';
  }
}
