import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = res.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      window.location.href = '/users'
    } catch (err: any) {
      console.error('Login error:', err)
      const message = err?.response?.data?.message || err?.message || 'Login failed'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>🔐 Login</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Sign in to your account
      </p>
      
      <form onSubmit={submit}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={loading}
        />

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? '🔄 Logging in...' : '✨ Sign In'}
        </button>

        {error && <p className="error">{error}</p>}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Sign up here
          </a>
        </p>
      </form>
    </div>
  )
}
