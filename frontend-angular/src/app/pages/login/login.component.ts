import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Login to ShopNest</h2>
      <input [(ngModel)]="email" type="email" placeholder="Email" />
      <input [(ngModel)]="password" type="password" placeholder="Password" />
      <button (click)="login()">Login</button>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p>No account? <a routerLink="/register">Register</a></p>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => this.error = err.error.message || 'Login failed',
    });
  }
}