import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Users from './pages/Users'
import Protected from './pages/Protected'
import Leaderboard from './pages/Leaderboard'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import './styles.css'

const Root = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="protected"
            element={
              <ProtectedRoute>
                <Protected />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(<Root />)
