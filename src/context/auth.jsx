import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api.js'
import { getSession } from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = getSession()
    if (saved?.user) setUser(saved.user)

    async function boot() {
      try {
        if (saved?.token) {
          const me = await api.me()
          setUser(me)
        }
      } catch {
        // token invalid / backend down -> keep saved user if present
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  const value = useMemo(() => {
    async function login({ email, password }) {
      const u = await api.login({ email, password })
      setUser(u)
      return u
    }

    function logout() {
      api.logout()
      setUser(null)
    }

    return { user, loading, login, logout, isAuthed: !!user }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

