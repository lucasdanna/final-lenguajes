import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

type User = { id: string; name: string; email: string }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      api.get('/api/auth/me').then((res) => setUser(res.data)).catch(() => setUser(null))
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  async function login(email: string, password: string) {
    const res = await api.post('/api/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post('/api/auth/register', { name, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

