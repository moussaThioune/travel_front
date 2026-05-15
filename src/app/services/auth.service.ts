import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, PendingBooking } from '../models/models';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'vgr_session';
  private readonly PENDING_BOOKING_KEY = 'vgr_pending_booking';
  private readonly API = 'https://travel-production-c3e3.up.railway.app/api/auth';

  private _user = signal<AuthResponse | null>(null);
  readonly currentUser  = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._user());
  readonly isAdmin      = computed(() => this._user()?.role === 'ADMIN');
  readonly isClient     = computed(() => this._user()?.role === 'CLIENT');
  readonly userInitials = computed(() => {
    const u = this._user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '';
  });
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private notif: NotificationService
  ) {
    this.restoreSession();
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(r => {
        this.storeSession(r);
        this.notif.show('👋', 'Connexion réussie!', `Bienvenue ${r.firstName}!`, 'success');
      }),
      catchError(err => {
        const msg = err?.error?.message || err?.error || 'Email ou mot de passe incorrect.';
        return throwError(() => ({ message: msg }));
      })
    );
  }

  register(req: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API}/register`, req).pipe(
      catchError(err => {
        const msg = err?.error?.message || err?.error || 'Erreur lors de la création du compte.';
        return throwError(() => ({ message: msg }));
      })
    );
  }

  resendVerification(email: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API}/resend-verification`, null, { params: { email } }).pipe(
      catchError(err => {
        const msg = err?.error?.message || err?.error || 'Erreur lors du renvoi.';
        return throwError(() => ({ message: msg }));
      })
    );
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API}/verify-email`, { params: { token } }).pipe(
      tap(r => {
        this.storeSession(r);
        this.notif.show('✅', 'Compte activé!', `Bienvenue ${r.firstName}! Votre compte est maintenant actif.`, 'success');
      }),
      catchError(err => {
        const msg = err?.error?.message || err?.error || 'Lien de vérification invalide ou expiré.';
        return throwError(() => ({ message: msg }));
      })
    );
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/']);
    this.notif.show('👋', 'Déconnecté', 'À bientôt sur Voyageur!', 'info');
  }

  getToken(): string | null {
    return this._user()?.token ?? null;
  }

  savePendingBooking(booking: PendingBooking): void {
    localStorage.setItem(this.PENDING_BOOKING_KEY, JSON.stringify(booking));
  }

  getPendingBooking(): PendingBooking | null {
    try {
      const stored = localStorage.getItem(this.PENDING_BOOKING_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }

  clearPendingBooking(): void {
    localStorage.removeItem(this.PENDING_BOOKING_KEY);
  }

  storeSession(u: AuthResponse): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(u));
    this._user.set(u);
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const parsed: AuthResponse = JSON.parse(stored);
        if (parsed?.token && !parsed.token.startsWith('vgr-')) {
          this._user.set(parsed);
        } else {
          localStorage.removeItem(this.SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }
}
