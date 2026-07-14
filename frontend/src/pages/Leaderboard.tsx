import React, { useEffect, useState } from 'react'
import api from '../api'

interface LeaderboardEntry {
  userId: number
  username: string
  score: number
  rank: number
}

export default function Leaderboard() {
  const [gameName, setGameName] = useState('snake')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchLeaderboard = async (game: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/user/ranking/${game}`)
      setLeaderboard(res.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard(gameName)
  }, [gameName])

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <h2>🏆 Leaderboard</h2>
      
      <div>
        <label htmlFor="game-select">Select Game</label>
        <select
          id="game-select"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          style={{ marginBottom: '24px' }}
        >
          <option value="snake">🐍 Snake</option>
          <option value="flappy-bird">🐦 Flappy Bird</option>
          <option value="tetris">🎮 Tetris</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div
            style={{
              fontSize: '24px',
              marginBottom: '16px',
            }}
          >
            Loading scores
            <span className="loading"></span>
          </div>
        </div>
      ) : leaderboard.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Player</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.userId}
                style={{
                  backgroundColor:
                    index < 3 ? 'rgba(107, 114, 128, 0.05)' : 'transparent',
                }}
              >
                <td style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {getMedalEmoji(entry.rank)}
                </td>
                <td>{entry.username}</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                  {entry.score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p>No scores yet for this game</p>
        </div>
      )}
    </div>
  )
}
