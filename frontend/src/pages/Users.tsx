import React, { useState } from 'react'
import api from '../api'

export default function Users() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setUser(null)
    try {
      const res = await api.get('/user', { params: { email } })
      setUser(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'User lookup failed')
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/user/${id}`)
      setUser(null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="card">
      <h2>Find User</h2>
      <form onSubmit={search}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      {user && (
        <div className="result">
          <p>ID: {user.id}</p>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <button onClick={() => remove(user.id)}>Delete</button>
        </div>
      )}
    </div>
  )
}
