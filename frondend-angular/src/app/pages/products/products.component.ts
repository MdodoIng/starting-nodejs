import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h2>Products</h2>

      <!-- admin: add product form -->
      <div class="card" *ngIf="auth.isAdmin">
        <h3>Add Product</h3>
        <input [(ngModel)]="newProduct.name" placeholder="Name" />
        <input [(ngModel)]="newProduct.price" type="number" placeholder="Price" />
        <input [(ngModel)]="newProduct.stock" type="number" placeholder="Stock" />
        <button (click)="addProduct()">Add Product</button>
      </div>

      <!-- product list -->
      <div class="product-grid">
        <div class="product-card" *ngFor="let p of products">
          <h3>{{ p.name }}</h3>
          <p>Price: {{ p.price }}</p>
          <p>Stock: {{ p.stock }}</p>
          <button (click)="addToCart(p)">Add to Cart</button>
          <button class="danger" *ngIf="auth.isAdmin" (click)="deleteProduct(p.id)">
            Delete
          </button>
        </div>
      </div>

      <!-- cart -->
      <div class="card" *ngIf="cart.length > 0">
        <h3>Cart ({{ cart.length }} items)</h3>
        <p *ngFor="let p of cart">{{ p.name }} — {{ p.price }}</p>
        <p><strong>Total: {{ cartTotal }}</strong></p>
        <button (click)="placeOrder()">Place Order</button>
      </div>

      <p class="success" *ngIf="success">{{ success }}</p>
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  cart: Product[] = [];
  newProduct = { name: '', price: 0, stock: 0 };
  success = '';

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
    public auth: AuthService,
  ) { }

  ngOnInit() { this.load(); }

  load() {
    this.productsService.getAll().subscribe(p => this.products = p);
  }

  addToCart(product: Product) { this.cart.push(product); }

  get cartTotal() {
    return this.cart.reduce((sum, p) => sum + Number(p.price), 0).toFixed(2);
  }

  placeOrder() {
    const ids = this.cart.map(p => p.id);
    this.ordersService.placeOrder(ids).subscribe({
      next: () => {
        this.cart = [];
        this.success = 'Order placed successfully!';
        setTimeout(() => this.success = '', 3000);
      },
    });
  }

  addProduct() {
    this.productsService.create(this.newProduct).subscribe(() => {
      this.newProduct = { name: '', price: 0, stock: 0 };
      this.load();
    });
  }

  deleteProduct(id: string) {
    this.productsService.delete(id).subscribe(() => this.load());
  }
}