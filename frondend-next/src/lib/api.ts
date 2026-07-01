import { getToken } from './auth';

const BASE = 'http://localhost:3000';

// builds headers — attaches token if it exists
function headers(extra: Record<string, string> = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    request<{ id: string; email: string }>('POST', '/auth/register', { email, password }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>('POST', '/auth/login', { email, password }),
};

// Products
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const productsApi = {
  getAll: () => request<Product[]>('GET', '/products'),
  create: (data: Omit<Product, 'id'>) =>
    request<Product>('POST', '/products', data),
  delete: (id: string) => request<void>('DELETE', `/products/${id}`),
};

// Orders
export interface Order {
  id: string;
  total: number;
  status: string;
  products: Product[];
  createdAt: string;
}

export const ordersApi = {
  getAll: () => request<Order[]>('GET', '/orders'),
  create: (productIds: string[]) =>
    request<Order>('POST', '/orders', { productIds }),
};

// Users
export interface User {
  id: string;
  email: string;
  role: string;
}

export const usersApi = {
  getAll: () => request<User[]>('GET', '/users'),
  updateRole: (id: string, role: string) =>
    request<User>('PATCH', `/users/${id}/role`, { role }),
};