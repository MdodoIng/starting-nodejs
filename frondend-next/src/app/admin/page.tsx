'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi, User } from '../../lib/api';
import { isLoggedIn, isAdmin } from '../../lib/auth';
import styles from './page.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (!isAdmin()) return;
    usersApi.getAll().then(data => {
      setUsers(data);
      // pre-fill role dropdowns with current roles
      const map: Record<string, string> = {};
      data.forEach(u => { map[u.id] = u.role; });
      setRoles(map);
    });
  }, []);

  async function updateRole(id: string) {
    await usersApi.updateRole(id, roles[id]);
    alert('Role updated!');
  }

  if (!isAdmin()) {
    return <div className={styles.page}>
      <p className={styles.denied}>⛔ Admin access only</p>
    </div>;
  }

  return (
    <div className={styles.page}>
      <h2>Admin — Manage Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                <select
                  className={styles.roleSelect}
                  value={roles[u.id] || u.role}
                  onChange={e =>
                    setRoles(prev => ({ ...prev, [u.id]: e.target.value }))
                  }
                >
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <button
                  className={styles.saveBtn}
                  onClick={() => updateRole(u.id)}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}