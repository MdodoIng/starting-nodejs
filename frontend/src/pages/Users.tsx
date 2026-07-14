import React, { useState } from 'react'
import api from '../api'

export default function Users() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setUser(null)
    setLoading(true)
    
    try {
      const res = await api.get('/user', { params: { email } })
      setUser(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'User lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    
    try {
      await api.delete(`/user/${id}`)
      setUser(null)
      setEmail('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2>🔍 Find User</h2>
      <form onSubmit={search}>
        <label htmlFor="email-input">Email Address</label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Searching...' : 'Search User'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {user && (
        <div className="result">
          <div style={{ marginBottom: '12px' }}>
            <strong>👤 User Profile</strong>
          </div>
          <p>
            <strong>ID:</strong> <code style={{ color: '#6366f1' }}>{user.id}</code>
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button
            onClick={() => remove(user.id)}
            style={{
              width: '100%',
              marginTop: '16px',
              background: '#ef4444',
            }}
          >
            🗑️ Delete User
          </button>
        </div>
      )}
    </div>
  )
}
