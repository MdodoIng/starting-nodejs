import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
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
      <p className="section-eyebrow">Get your seat</p>
      <h1
        className="marquee-heading"
        style={{ fontSize: 34, marginBottom: 28 }}
      >
        Create an account
      </h1>

      {error && <div className="banner banner-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="text-faint" style={{ fontSize: 12 }}>
            At least 8 characters.
          </span>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: 20, fontSize: 14 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--gold)" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
