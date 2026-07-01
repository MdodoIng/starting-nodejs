'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../lib/api';
import styles from '../login/page.module.css'; // reuse same styles

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      await authApi.register(email, password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h2>Create Account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        className={styles.submitBtn}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
      {error && <p className="error">{error}</p>}
      <p className={styles.footer}>
        Have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}