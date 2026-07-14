import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/users">Users</Link>
        <Link to="/protected">Protected</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
