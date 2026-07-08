import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">&#9679;</span>
          MARQUEE
        </Link>

        <nav className="navbar-links">
          <Link to="/">Movies</Link>
          {user && <Link to="/reservations">My Tickets</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="text-muted navbar-user">
                {user.name}
                {isAdmin && (
                  <span className="pill pill-gold navbar-role">Admin</span>
                )}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
