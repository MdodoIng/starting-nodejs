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

  return (
    <div className="card">
      <h2>Leaderboard</h2>
      <div>
        <label>
          Game:
          <select value={gameName} onChange={(e) => setGameName(e.target.value)}>
            <option value="snake">Snake</option>
            <option value="flappy-bird">Flappy Bird</option>
            <option value="tetris">Tetris</option>
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : leaderboard.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.userId}>
                <td>{entry.rank}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No scores yet for this game</p>
      )}
    </div>
  )
}
