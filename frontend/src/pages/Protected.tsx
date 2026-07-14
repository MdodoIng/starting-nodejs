import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Protected() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/auth/protected')
        setMessage(JSON.stringify(res.data, null, 2))
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to access protected route')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2>🔐 Protected Route</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        This page is only accessible when authenticated with a valid JWT token.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading</div>
          <div className="loading"></div>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : message ? (
        <>
          <p style={{ fontWeight: '600', marginBottom: '12px' }}>✅ Authenticated User Data:</p>
          <pre
            style={{
              background: '#f1f5f9',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
            }}
          >
            {message}
          </pre>
        </>
      ) : null}
    </div>
  )
}
