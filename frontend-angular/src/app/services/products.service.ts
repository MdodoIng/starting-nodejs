import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = 'http://localhost:3000/products';
  constructor(private http: HttpClient) { }

  getAll() { return this.http.get<Product[]>(this.apiUrl); }
  create(data: Partial<Product>) { return this.http.post<Product>(this.apiUrl, data); }
  delete(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }
}