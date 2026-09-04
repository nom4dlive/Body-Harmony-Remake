import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('bh_auth')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Corrupted auth data, clearing...", e)
        localStorage.removeItem('bh_auth')
      }
    }
    setLoading(false)

    // Listen for 401 from api.js
    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (username, password) => {
    try {
      const data = await api.login({ username, password })
      if (data && data.success) {
        // data.user contains info, data.token contains session token
        const authData = {
          ...data.user,
          token: data.token,
          loggedAt: new Date().toISOString()
        }
        localStorage.setItem('bh_auth', JSON.stringify(authData))
        setUser(authData)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('bh_auth')
    setUser(null)
  }

  const syncUser = () => {
    const savedUser = localStorage.getItem('bh_auth')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) { localStorage.removeItem('bh_auth') }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, syncUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
