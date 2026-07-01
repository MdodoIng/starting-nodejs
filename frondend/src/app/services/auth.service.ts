import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  // BehaviorSubject holds the current user — any component can subscribe to it
  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(
    this.getUserFromToken()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.currentUserSubject.next(this.getUserFromToken());
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // decode JWT payload without a library — just base64 decode the middle part
  private getUserFromToken(): JwtPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // check token hasn't expired
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  get currentUser(): JwtPayload | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}