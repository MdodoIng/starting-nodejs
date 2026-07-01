'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, Order } from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';
import styles from './page.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    ordersApi.getAll().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className={styles.page}><p>Loading...</p></div>;

  return (
    <div className={styles.page}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p className={styles.empty}>No orders yet. Go buy something!</p>
      ) : orders.map(order => (
        <div key={order.id} className={styles.order}>
          <div className={styles.orderHeader}>
            <span className={styles.date}>
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
            <span className={styles.status}>{order.status}</span>
          </div>
          <ul className={styles.products}>
            {order.products.map(p => (
              <li key={p.id}>• {p.name} — ${p.price}</li>
            ))}
          </ul>
          <p className={styles.total}>Total: ${order.total}</p>
        </div>
      ))}
    </div>
  );
}