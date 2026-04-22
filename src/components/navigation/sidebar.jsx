import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, Clock3, Menu } from 'lucide-react'
import { useAuth } from '../../context/auth.jsx'
import { cn } from '../../utils/cn.js'
import { navConfig } from './nav-items.js'

export function Sidebar() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = useMemo(() => navConfig[user?.role] ?? [], [user?.role])

  const content = (
    <div className={cn('flex h-full flex-col gap-4 p-4', collapsed ? 'w-[76px]' : 'w-[264px]')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Clock3 className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">TTAS</div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">Attendance System</div>
            </div>
          ) : null}
        </div>
        <button
          className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                )
              }
              end
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span className="truncate">{it.label}</span> : null}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Signed in as <span className="font-semibold">{user?.name}</span>
        </div>
      ) : null}
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="fixed left-3 top-3 z-30 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/30 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="absolute left-0 top-0 h-full w-[280px] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {content}
          </div>
        </div>
      ) : null}
    </>
  )
}

