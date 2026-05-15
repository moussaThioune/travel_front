import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  showNotifPanel = false;
  showUserMenu = false;

  constructor(
    public authService: AuthService,
    public notifService: NotificationService,
    public reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 60;
  }

  navigate(path: string): void {
    this.isMenuOpen = false;
    this.showUserMenu = false;
    this.router.navigate([path]);
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
  }

  toggleNotif(): void {
    this.showNotifPanel = !this.showNotifPanel;
    this.showUserMenu = false;
    if (this.showNotifPanel) {
      this.notifService.markAllRead();
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifPanel = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeDropdowns(): void {
    this.showNotifPanel = false;
    this.showUserMenu = false;
  }

  get unreadCount(): number {
    return this.notifService.unreadCount();
  }

  get notifications() {
    return this.notifService.appNotifications().slice(0, 6);
  }
}
