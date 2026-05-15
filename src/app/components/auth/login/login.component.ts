import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPwd = false;
  loading = false;
  errorMsg = '';
  private returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  fillDemo(type: 'admin' | 'client'): void {
    if (type === 'admin') {
      this.email = 'admin@voyageur.fr';
      this.password = 'admin123';
    } else {
      this.email = 'demo@voyageur.fr';
      this.password = 'demo123';
    }
  }

  doLogin(): void {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // Rediriger l'admin vers le backoffice
        if (res.role === 'ADMIN' && this.returnUrl === '/') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.message || 'Identifiants incorrects.';
      }
    });
  }
}
