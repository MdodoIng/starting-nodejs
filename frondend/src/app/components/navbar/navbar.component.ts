import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <span class="brand">🛍️ ShopNest</span>
      <div class="links" *ngIf="auth.isLoggedIn; else guestLinks">
        <a routerLink="/products">Products</a>
        <a routerLink="/orders">Orders</a>
        <a routerLink="/admin" *ngIf="auth.isAdmin">Admin</a>
        <span class="email">{{ auth.currentUser?.email }}</span>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <ng-template #guestLinks>
        <a routerLink="/login">Login</a>
        <a routerLink="/register">Register</a>
      </ng-template>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: #1a1a2e;
      color: white;
    }
    .brand { font-size: 1.3rem; font-weight: bold; }
    .links { display: flex; align-items: center; gap: 1rem; }
    .links a { color: #ccc; text-decoration: none; }
    .links a:hover { color: white; }
    .email { color: #aaa; font-size: 0.85rem; }
    button {
      background: #e94560;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) { }
}