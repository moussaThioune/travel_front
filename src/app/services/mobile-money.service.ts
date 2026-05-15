import { Injectable } from '@angular/core';
import { MobileMoneyProvider } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MobileMoneyService {

  readonly PROVIDERS: MobileMoneyProvider[] = [
    {
      id: 'ORANGE_MONEY',
      label: 'Orange Money',
      shortLabel: 'Orange',
      emoji: '🟠',
      color: '#FF6600',
      bgColor: '#FFF3EB',
      borderColor: '#FF6600',
      textColor: '#B84700',
      prefix: '+221 7',
      placeholder: '7X XXX XX XX',
      ussdCode: '#144#',
      description: 'Paiement instantané via Orange Money. Saisissez votre numéro Orange et validez avec votre code PIN.',
      countries: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Guinée']
    },
    {
      id: 'WAVE',
      label: 'Wave',
      shortLabel: 'Wave',
      emoji: '🔵',
      color: '#1E40AF',
      bgColor: '#EFF6FF',
      borderColor: '#3B82F6',
      textColor: '#1E3A8A',
      prefix: '+221 7',
      placeholder: '7X XXX XX XX',
      ussdCode: '',
      description: 'Paiement via l\'application Wave. Scannez le QR code ou entrez votre numéro Wave pour payer.',
      countries: ['Sénégal', 'Côte d\'Ivoire', 'Burkina Faso', 'Mali', 'Ouganda']
    },
    {
      id: 'FREE_MONEY',
      label: 'Free Money',
      shortLabel: 'Free',
      emoji: '🟢',
      color: '#16A34A',
      bgColor: '#F0FDF4',
      borderColor: '#22C55E',
      textColor: '#14532D',
      prefix: '+221 7',
      placeholder: '6X XXX XX XX',
      ussdCode: '#1234#',
      description: 'Paiement via Free Money. Entrez votre numéro Free et confirmez le paiement avec votre code secret.',
      countries: ['Sénégal']
    }
  ];

  getProvider(id: string): MobileMoneyProvider | undefined {
    return this.PROVIDERS.find(p => p.id === id);
  }

  formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0,2) + ' ' + digits.slice(2);
    if (digits.length <= 7) return digits.slice(0,2) + ' ' + digits.slice(2,5) + ' ' + digits.slice(5);
    return digits.slice(0,2) + ' ' + digits.slice(2,5) + ' ' + digits.slice(5,7) + ' ' + digits.slice(7,9);
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateRef(provider: string): string {
    const prefix = { ORANGE_MONEY: 'OM', WAVE: 'WV', FREE_MONEY: 'FM' }[provider] || 'MM';
    return prefix + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  getLabelForMode(mode: string): string {
    const labels: Record<string, string> = {
      CARTE_BANCAIRE: '💳 Carte bancaire',
      VIREMENT: '🏦 Virement bancaire',
      PAYPAL: '🔵 PayPal',
      ORANGE_MONEY: '🟠 Orange Money',
      WAVE: '🔵 Wave',
      FREE_MONEY: '🟢 Free Money'
    };
    return labels[mode] || mode;
  }
}
