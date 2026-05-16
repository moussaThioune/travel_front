import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'fr' | 'en' | 'ar';

export interface LangOption {
  code: Lang;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly langs: LangOption[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
    { code: 'ar', label: 'العربية',  flag: '🇸🇦', dir: 'rtl' }
  ];

  private _current = signal<Lang>('fr');
  readonly current = this._current.asReadonly();

  constructor(private translate: TranslateService) {
    const saved = (localStorage.getItem('vgr_lang') as Lang) || 'fr';
    this.setLang(saved);
  }

  setLang(code: Lang): void {
    this._current.set(code);
    this.translate.use(code);
    localStorage.setItem('vgr_lang', code);

    const dir = this.langs.find(l => l.code === code)?.dir ?? 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', code);
    document.body.classList.toggle('rtl', dir === 'rtl');
  }

  get currentLang(): LangOption {
    return this.langs.find(l => l.code === this._current()) ?? this.langs[0];
  }
}
