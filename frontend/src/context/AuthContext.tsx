import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'

interface User {
  userId: number
  username: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
  }, [])

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors
    } finally {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
