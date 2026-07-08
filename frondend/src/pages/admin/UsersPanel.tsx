import { useEffect, useState } from "react";
import type { User } from "../../api/types";
import { UsersApi } from "../../api/endpoints";
import { Spinner } from "../../components/Spinner";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export function UsersPanel() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<number | null>(null);

  function load() {
    UsersApi.list()
      .then((res) => setUsers(res.users))
      .catch(() => setError("Could not load users."));
  }
  useEffect(load, []);

  async function handlePromote(id: number) {
    setPromotingId(id);
    setError(null);
    try {
      await UsersApi.promote(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not promote user.",
      );
    } finally {
      setPromotingId(null);
    }
  }

  if (users === null) return <Spinner />;

  return (
    <div>
      <h3 className="admin-subheading" style={{ marginTop: 0 }}>
        All users
      </h3>
      {error && <div className="banner banner-danger">{error}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name}{" "}
                  {u.id === me?.id && <span className="text-faint">(you)</span>}
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span
                    className={`pill ${u.role === "admin" ? "pill-gold" : ""}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.role === "user" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={promotingId === u.id}
                      onClick={() => handlePromote(u.id)}
                    >
                      {promotingId === u.id ? "Promoting…" : "Promote to admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
