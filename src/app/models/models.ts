// ============================================================
// VOYAGEUR - Modèles TypeScript complets
// ============================================================

// ===== AUTH =====
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; phone?: string; }
export interface RegisterResponse { email: string; firstName: string; message: string; }
export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { token: string; type: string; userId: number; email: string; firstName: string; lastName: string; role: UserRole; phone?: string; }
export type UserRole = 'ADMIN' | 'CLIENT';

// ===== PENDING BOOKING (sauvegardé avant inscription) =====
export interface PendingBooking {
  voyageId: number;
  voyageTitre: string;
  nbPersonnes: number;
  typeHebergement: string;
  passportNumber: string;
  notes: string;
  returnUrl: string;
}

// ===== VOYAGE =====
export type VoyageStatut = 'ACTIF' | 'COMPLET' | 'ANNULE' | 'TERMINE';
export type VoyageCategorie = 'COLONIE' | 'ZIARRA' | 'OMRA' | 'HADJ' | 'AUTRE';

export interface Hotel { id: number; nom: string; ville: string; pays: string; etoiles: number; description?: string; imageUrl?: string; noteMoyenne?: number; }
export interface Vol { id: number; numeroVol: string; compagnie: string; villeDepart: string; villeArrivee: string; dateDepart: string; dateArrivee: string; }

export interface Voyage {
  id: number; titre: string; description: string; destination: string; paysDestination: string;
  dateDepart: string; dateRetour: string; prixParPersonne: number;
  nombrePlacesTotal: number; nombrePlacesDisponibles: number;
  imageUrl: string; categorie: VoyageCategorie; statut: VoyageStatut; dureeJours: number;
  hotel?: Hotel; volAller?: Vol; volRetour?: Vol;
  inclusions?: string[]; highlights?: string[];
}

export interface VoyageSearchParams { destination?: string; dateDepart?: string; prixMax?: number; places?: number; categorie?: VoyageCategorie; }
export interface VoyageCreateRequest {
  titre: string; description: string; destination: string; paysDestination: string;
  dateDepart: string; dateRetour: string; prixParPersonne: number; nombrePlacesTotal: number;
  imageUrl?: string; categorie: VoyageCategorie;
}

// ===== RESERVATION =====
export type ReservationStatut = 'EN_ATTENTE' | 'CONFIRMEE' | 'PAYEE' | 'ANNULEE';

export interface ReservationRequest { voyageId: number; nombrePersonnes: number; typeHebergement?: string; passportNumber?: string; notes?: string; }
export interface ClientSummary { id: number; firstName: string; lastName: string; email: string; phone?: string; }

export interface TimelineEvent { icon: string; title: string; description: string; date?: string; done: boolean; current?: boolean; }

export interface Reservation {
  id: number; numeroReservation: string; client: ClientSummary; voyage: Voyage;
  nombrePersonnes: number; prixTotal: number; statut: ReservationStatut;
  dateReservation: string; notes?: string; passportNumber?: string; typeHebergement?: string;
  montantPaye: number; montantRestant: number;
  timeline?: TimelineEvent[]; paiements?: Paiement[];
}

// ===== PAIEMENT — Mobile Money =====
export type ModePaiement = 'CARTE_BANCAIRE' | 'VIREMENT' | 'PAYPAL' | 'ORANGE_MONEY' | 'WAVE' | 'FREE_MONEY';
export type PaiementStatut = 'EN_ATTENTE' | 'EN_COURS' | 'SUCCES' | 'ECHEC' | 'REMBOURSE';

export interface MobileMoneyProvider {
  id: 'ORANGE_MONEY' | 'WAVE' | 'FREE_MONEY';
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  prefix: string;
  placeholder: string;
  ussdCode: string;
  description: string;
  countries: string[];
}

export interface Paiement {
  id: number;
  numeroPaiement: string;
  reservationId: number;
  numeroReservation: string;
  clientNom: string;
  clientEmail: string;
  clientPhone?: string;
  montant: number;
  modePaiement: ModePaiement;
  statut: PaiementStatut;
  datePaiement: string;
  referenceTransaction?: string;
  phoneNumber?: string;
  validatedAt?: string;
  validatedBy?: string;
  notes?: string;
  voyageTitre?: string;
  voyageDestination?: string;
}

export interface PaiementRequest {
  reservationId: number; montant: number; modePaiement: ModePaiement;
  referenceTransaction?: string; phoneNumber?: string;
  cardNumber?: string; cardHolder?: string; notes?: string;
}

// ===== NOTIFICATIONS =====
export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export interface Notification { id: string; icon: string; title: string; message: string; type: NotificationType; timestamp: Date; read: boolean; reservationRef?: string; }

// ===== DESTINATION =====
export interface Destination { name: string; country: string; region: string; imageUrl: string; minPrice: number; voyagesCount: number; tag?: string; featured?: boolean; }

// ===== ASSURÉS =====
export type StatutAssure = 'ACTIF' | 'EXPIRE' | 'ANNULE' | 'VENDU';
export type TypeNotif = 'EMAIL' | 'SMS';

export interface Assure {
  id: number;
  nom: string;
  prenom?: string;
  nomComplet: string;
  marque?: string;
  immatricule?: string;
  puissanceFiscale?: string;
  carburant?: string;
  numeroPolicce?: string;
  montantPrime?: number;
  echeance: string;
  dateRappel?: string;
  periodeGarantieDebut?: string;
  periodeGarantieAns?: number;
  telephone: string;
  telephone2?: string;
  email?: string;
  statut: StatutAssure;
  notes?: string;
  echeanceProche: boolean;
  expire: boolean;
  joursRestants: number;
  createdAt: string;
  notifications?: NotifAssure[];
}

export interface NotifAssure {
  id: number;
  type: TypeNotif;
  succes: boolean;
  message: string;
  envoyeAt: string;
  erreur?: string;
}

export interface AssureRequest {
  nom: string;
  prenom?: string;
  marque?: string;
  immatricule?: string;
  puissanceFiscale?: string;
  carburant?: string;
  numeroPolicce?: string;
  montantPrime?: number;
  echeance: string;
  dateRappel?: string;
  periodeGarantieDebut?: string;
  periodeGarantieAns?: number;
  telephone: string;
  telephone2?: string;
  email?: string;
  statut?: StatutAssure;
  notes?: string;
}

export interface AssureStats {
  total: number;
  actifs: number;
  echeancesProches: number;
  expires: number;
  vendus: number;
  parMois: { mois: number; moisLabel: string; count: number }[];
}

export interface NotifManuelleRequest {
  email: boolean;
  sms: boolean;
  messagePersonnalise?: string;
}
