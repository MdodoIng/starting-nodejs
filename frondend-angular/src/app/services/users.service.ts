import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'http://localhost:3000/users';
  constructor(private http: HttpClient) { }

  getAll() { return this.http.get<User[]>(this.apiUrl); }
  updateRole(id: string, role: string) {
    return this.http.patch(`${this.apiUrl}/${id}/role`, { role });
  }
}