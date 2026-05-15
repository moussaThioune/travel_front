import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _toasts = signal<Notification[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private _appNotifications = signal<Notification[]>([]);
  readonly appNotifications = this._appNotifications.asReadonly();
  readonly unreadCount = () => this._appNotifications().filter(n => !n.read).length;

  show(icon: string, title: string, message: string, type: NotificationType = 'success', duration = 5000): void {
    const notif: Notification = {
      id: Date.now().toString() + Math.random(),
      icon, title, message, type,
      timestamp: new Date(),
      read: false
    };
    this._toasts.update(t => [notif, ...t]);
    setTimeout(() => this.removeToast(notif.id), duration);
  }

  removeToast(id: string): void {
    this._toasts.update(t => t.filter(n => n.id !== id));
  }

  addAppNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const full: Notification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    this._appNotifications.update(n => [full, ...n]);
    this.show(notif.icon, notif.title, notif.message, notif.type);
  }

  markAllRead(): void {
    this._appNotifications.update(n => n.map(notif => ({ ...notif, read: true })));
  }

  markRead(id: string): void {
    this._appNotifications.update(n =>
      n.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }
}
