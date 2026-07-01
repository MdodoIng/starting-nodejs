'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, removeToken, JwtPayload } from '../../lib/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);

  // read user on mount (client only — cookies aren't available on server)
  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    removeToken();
    setUser(null);
    router.push('/login');
  }

  return (
    <nav className={styles.nav}>
      <Link href="/products" className={styles.brand}>
        🛍️ ShopNest
      </Link>

      <div className={styles.links}>
        {user ? (
          <>
            <Link href="/products">Products</Link>
            <Link href="/orders">Orders</Link>
            {user.role === 'admin' && <Link href="/admin">Admin</Link>}
            <span className={styles.email}>{user.email}</span>
            <button className={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}