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
      setError('Invalid email address')
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
      
      // Force page reload to update auth context
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
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <label>
          Username
          <input 
            type="text"
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="alphanumeric and underscore only"
            disabled={loading}
          />
        </label>
        <label>
          Email
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 6 characters"
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
