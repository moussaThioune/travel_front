import { Component, computed } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  template: `
<div class="toast-container-global">
  <div class="toast-item" *ngFor="let toast of toasts()"
       [class]="'toast-' + toast.type">
    <span class="ti-icon">{{ toast.icon }}</span>
    <div class="ti-body">
      <div class="ti-title">{{ toast.title }}</div>
      <div class="ti-msg">{{ toast.message }}</div>
    </div>
    <button class="ti-close" (click)="notifService.removeToast(toast.id)">
      <i class="bi bi-x"></i>
    </button>
  </div>
</div>
  `,
  styles: [`
.toast-container-global {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  pointer-events: none;
  > * { pointer-events: auto; }
}

.toast-item {
  background: white;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 12px 50px rgba(0,0,0,0.15);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-left: 4px solid var(--teal);
  animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &.toast-success { border-left-color: var(--teal); }
  &.toast-info { border-left-color: #3b82f6; }
  &.toast-warning { border-left-color: var(--gold); }
  &.toast-error { border-left-color: var(--coral); }
}

@keyframes toastIn {
  from { transform: translateX(100px) scale(0.9); opacity: 0; }
  to { transform: translateX(0) scale(1); opacity: 1; }
}

.ti-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.ti-body { flex: 1; min-width: 0; }
.ti-title { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.ti-msg { font-size: 13px; color: var(--gray); line-height: 1.4; }
.ti-close {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.2s;
  &:hover { color: var(--coral); }
}
  `]
})
export class ToastComponent {
  readonly toasts = computed(() => this.notifService.toasts());
  constructor(public notifService: NotificationService) {}
}
