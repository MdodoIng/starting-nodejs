import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Order {
  id: string;
  total: number;
  status: string;
  products: any[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = 'http://localhost:3000/orders';
  constructor(private http: HttpClient) { }

  getMyOrders() { return this.http.get<Order[]>(this.apiUrl); }
  placeOrder(productIds: string[]) {
    return this.http.post<Order>(this.apiUrl, { productIds });
  }
}