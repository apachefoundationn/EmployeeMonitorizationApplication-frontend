import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'ttas.theme'

function applyTheme(mode) {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const initial = saved === 'dark' || saved === 'light' ? saved : 'light'
    setMode(initial)
    applyTheme(initial)
  }, [])

  const value = useMemo(() => {
    function toggle() {
      const next = mode === 'dark' ? 'light' : 'dark'
      setMode(next)
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
    }
    return { mode, setMode, toggle }
  }, [mode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

