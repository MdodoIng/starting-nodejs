'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, ordersApi, Product } from '../../lib/api';
import { isLoggedIn, isAdmin } from '../../lib/auth';
import styles from './page.module.css';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await productsApi.getAll();
    setProducts(data);
    setLoading(false);
  }

  function addToCart(p: Product) {
    setCart(prev => [...prev, p]);
  }

  function removeFromCart(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  const cartTotal = cart.reduce((s, p) => s + Number(p.price), 0).toFixed(2);

  async function placeOrder() {
    await ordersApi.create(cart.map(p => p.id));
    setCart([]);
    setSuccess('Order placed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function addProduct() {
    if (!name || !price || !stock) return;
    await productsApi.create({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
    });
    setName(''); setPrice(''); setStock('');
    load();
  }

  async function deleteProduct(id: string) {
    await productsApi.delete(id);
    load();
  }

  return (
    <div className={styles.page}>
      <h2>Products</h2>

      {/* admin form */}
      {isAdmin() && (
        <div className={styles.card}>
          <h3>Add Product</h3>
          <div className={styles.formRow}>
            <input placeholder="Name" value={name}
              onChange={e => setName(e.target.value)} />
            <input placeholder="Price" type="number" value={price}
              onChange={e => setPrice(e.target.value)} />
            <input placeholder="Stock" type="number" value={stock}
              onChange={e => setStock(e.target.value)} />
            <button onClick={addProduct}>Add</button>
          </div>
        </div>
      )}

      {/* product grid */}
      {loading ? <p>Loading...</p> : (
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p.id} className={styles.productCard}>
              <h3>{p.name}</h3>
              <p>Price: ${p.price}</p>
              <p>Stock: {p.stock}</p>
              <div className={styles.actions}>
                <button onClick={() => addToCart(p)}>Add to Cart</button>
                {isAdmin() && (
                  <button className={styles.deleteBtn}
                    onClick={() => deleteProduct(p.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* cart */}
      {cart.length > 0 && (
        <div className={styles.card}>
          <h3>Cart ({cart.length} items)</h3>
          {cart.map((p, i) => (
            <div key={i} className={styles.cartItem}>
              <span>{p.name} — ${p.price}</span>
              <button onClick={() => removeFromCart(i)}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                ✕
              </button>
            </div>
          ))}
          <p className={styles.total}><strong>Total: ${cartTotal}</strong></p>
          <button className={styles.orderBtn} onClick={placeOrder}>
            Place Order
          </button>
        </div>
      )}

      {success && <p className="success">{success}</p>}
    </div>
  );
}