import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `
})
export class AppComponent {
  title = 'Voyageur — L\'agence de voyage d\'exception';

  constructor(langService: LanguageService) {
    // Ensures LanguageService is instantiated on startup,
    // applying saved language + RTL direction from localStorage
  }
}
