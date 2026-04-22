import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ToastViewport } from '../components/toast.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((toast) => {
    const id = toast.id ?? `t_${Math.random().toString(16).slice(2)}`
    const next = {
      id,
      title: toast.title ?? 'Notice',
      message: toast.message ?? '',
      variant: toast.variant ?? 'default',
      timeoutMs: toast.timeoutMs ?? 2800,
    }
    setToasts((prev) => [next, ...prev].slice(0, 4))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, next.timeoutMs)
    return id
  }, [])

  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const value = useMemo(() => ({ push, remove }), [push, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

