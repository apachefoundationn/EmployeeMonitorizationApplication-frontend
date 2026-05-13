import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api.js'
import { getSession } from '../utils/storage.js'
import { useToast } from './toast.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

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

  // Auto-logout after 20 minutes of inactivity
  useEffect(() => {
    let timeoutId;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          api.logout();
          setUser(null);
          toast.push({
            title: 'Session Expired',
            message: 'You have been automatically logged out due to 20 minutes of inactivity.',
            timeoutMs: 5000,
          });
        }, 20 * 60 * 1000); // 20 minutes
      }
    };

    resetTimeout();

    const handleActivity = () => {
      resetTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    if (user) {
      events.forEach(event => window.addEventListener(event, handleActivity));
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user, toast]);

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

