# ✈️ Voyageur — Application de Voyage Angular 17

Application full-stack de réservation de voyages construite avec **Angular 17** + **Spring Boot 3** (backend).

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Angular CLI** 17.x (`npm install -g @angular/cli@17`)

### Installation & Lancement

```bash
# Cloner / extraire le projet
cd voyageur-angular

# Installer les dépendances (une seule fois)
npm install

# Lancer le serveur de développement
npm start
# → http://localhost:4200
```

### Build de production

```bash
npm run build:prod
# Fichiers dans dist/voyageur/
```

---

## 🏗️ Architecture du projet

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/           # Barre de navigation responsive + notifications
│   │   ├── home/             # Page d'accueil (hero, search, destinations, voyages, testimonials)
│   │   ├── voyage-card/      # Carte voyage réutilisable
│   │   ├── voyages/          # Liste des voyages avec filtres & tri
│   │   ├── voyage-detail/    # Détail voyage + tunnel de réservation 4 étapes
│   │   ├── auth/
│   │   │   ├── login/        # Page de connexion
│   │   │   └── register/     # Page d'inscription
│   │   ├── reservations/     # Mes réservations + suivi timeline
│   │   ├── admin/            # Panel admin (voyages + réservations)
│   │   ├── footer/           # Pied de page complet
│   │   └── toast/            # Notifications toast
│   ├── services/
│   │   ├── auth.service.ts         # Authentification + JWT (Signals)
│   │   ├── voyage.service.ts       # CRUD voyages (Signals)
│   │   ├── reservation.service.ts  # Réservations + paiement (Signals)
│   │   ├── notification.service.ts # Notifications temps réel (Signals)
│   │   └── mock-data.service.ts    # Données de démonstration
│   ├── models/models.ts      # Types & interfaces TypeScript
│   ├── guards/auth.guard.ts  # Guards (auth, admin, guest)
│   ├── interceptors/         # JWT interceptor HTTP
│   ├── pipes/custom.pipes.ts # Pipes personnalisés
│   └── app.module.ts         # Module racine
├── environments/             # Config dev/prod
├── styles.scss               # Styles globaux + variables CSS
└── index.html
```

---

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Client | `demo@voyageur.fr` | `demo123` |
| Admin | `admin@voyageur.fr` | `admin123` |

Vous pouvez aussi **créer votre propre compte** via la page d'inscription.

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription avec validation complète des formulaires
- Connexion avec session persistante (localStorage)
- Guards de route (auth, admin, guest)
- Intercepteur JWT pour les requêtes HTTP

### ✈️ Catalogue voyages
- 6 voyages illustrés avec vraies photos Unsplash
- Filtres multicritères (destination, date, budget, personnes, catégorie)
- Tri (prix, date, disponibilité, durée)
- Vue grille / liste
- Barre de disponibilité dynamique (vert/orange/rouge)

### 📅 Tunnel de réservation (4 étapes)
1. **Voyageurs** — Nombre de personnes, chambre, passeport, notes
2. **Récapitulatif** — Résumé complet (voyage, hôtel, vol, total)
3. **Paiement** — Carte bancaire, PayPal ou virement bancaire
4. **Confirmation** — Numéro de réservation unique généré

### 📍 Suivi temps réel
- Timeline visuelle avec 6 étapes (réservé → confirmé → payé → vérification → hôtel → départ)
- Notifications toast pour chaque événement
- Bouton "Simuler notification" pour démonstration
- Annulation avec message de remboursement

### 🔔 Notifications
- Système de notifications par Signal Angular
- Bell icon avec compteur non-lus dans la navbar
- Toasts animés en bas à droite
- Panel de notifications avec historique

### 👩‍💼 Panel Admin
- Tableau de bord avec statistiques
- CRUD complet des voyages (création, modification, suppression)
- Tableau de toutes les réservations
- Accès restreint aux admins

---

## 🎨 Design System

### Couleurs
```scss
--ink: #0d0d0d        // Texte principal
--cream: #f7f3ed      // Fond principal
--sand: #e8dfd0       // Bordures, fonds légers
--gold: #c9a84c       // Accent doré
--teal: #1a6b6b       // Couleur primaire
--teal-dark: #0f4545  // Teal foncé
--coral: #e8624a      // Erreurs, annulations
```

### Typographie
- **Playfair Display** — Titres, prix, chiffres
- **DM Sans** — Corps de texte, boutons, interface

### Dépendances UI
- **Bootstrap 5.3.3** — Grid, utilities
- **Bootstrap Icons 1.11.3** — Icônes SVG
- **Animate.css 4.1.1** — Animations CSS

---

## 🔌 Connexion avec le backend Spring Boot

Pour connecter le frontend à votre backend, modifiez `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // URL de votre backend
  ...
};
```

Décommentez les vrais appels HTTP dans les services en remplaçant les `of(mockData)` par `this.http.get/post/put/delete`.

---

## 📦 Scripts npm

| Commande | Description |
|----------|-------------|
| `npm start` | Serveur dev + ouverture navigateur |
| `npm run build` | Build de production |
| `npm run build:prod` | Build optimisé (minification, AOT) |
| `npm test` | Tests unitaires (Karma + Jasmine) |
| `npm run lint` | Vérification ESLint |

---

## 📄 Licence

Projet développé pour Voyageur SAS — Usage commercial soumis à licence.
