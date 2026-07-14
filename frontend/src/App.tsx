import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app">
      <nav>
        <div className="nav-left">
          <Link to="/">Login</Link>
          <Link to="/signup">Signup</Link>
          {isAuthenticated && (
            <>
              <Link to="/users">Users</Link>
              <Link to="/protected">Protected</Link>
              <Link to="/leaderboard">Leaderboard</Link>
            </>
          )}
        </div>
        {isAuthenticated && (
          <div className="nav-right">
            <span className="user-info">{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
