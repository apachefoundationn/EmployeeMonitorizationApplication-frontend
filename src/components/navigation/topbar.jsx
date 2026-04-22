import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/auth.jsx'
import { useTheme } from '../../context/theme.jsx'
import { Button } from '../button.jsx'
import { cn } from '../../utils/cn.js'

function titleFromPath(path) {
  const parts = path.split('/').filter(Boolean)
  if (!parts.length) return 'Dashboard'
  const last = parts[parts.length - 1]
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Topbar() {
  const { user, logout } = useAuth()
  const { mode, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname])

  function onLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="min-w-0 pl-24 lg:pl-0">
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {user?.role?.toUpperCase()} • {user?.email}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={toggle} className="gap-2">
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{mode === 'dark' ? 'Light' : 'Dark'}</span>
          </Button>

          <div className="relative">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                {(user?.name ?? 'U')
                  .split(' ')
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <span className="hidden md:inline">{user?.name}</span>
              <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <button
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

