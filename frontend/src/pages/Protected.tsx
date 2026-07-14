import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Protected() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/auth/protected')
        setMessage(JSON.stringify(res.data))
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed')
      }
    })()
  }, [])

  return (
    <div className="card">
      <h2>Protected</h2>
      {message && <pre>{message}</pre>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
