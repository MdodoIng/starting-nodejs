import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--narrow">
      <p className="section-eyebrow">Welcome back</p>
      <h1
        className="marquee-heading"
        style={{ fontSize: 34, marginBottom: 28 }}
      >
        Log in
      </h1>

      {error && <div className="banner banner-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: 20, fontSize: 14 }}>
        New here?{" "}
        <Link to="/signup" style={{ color: "var(--gold)" }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
