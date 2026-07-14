import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username must be alphanumeric or underscore only')
      return false
    }
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
      const res = await api.post('/auth/signup', { username, email, password })
      const { accessToken, refreshToken, user } = res.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      window.location.href = '/users'
    } catch (err: any) {
      console.error('Signup error:', err)
      const message = err?.response?.data?.message || err?.message || 'Signup failed'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>✨ Create Account</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Join us and start playing
      </p>

      <form onSubmit={submit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="alphanumeric and underscore only"
          disabled={loading}
        />

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
          {loading ? '🔄 Creating Account...' : '🎮 Sign Up'}
        </button>

        {error && <p className="error">{error}</p>}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          Already have an account?{' '}
          <a
            href="/"
            style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Sign in here
          </a>
        </p>
      </form>
    </div>
  )
}
