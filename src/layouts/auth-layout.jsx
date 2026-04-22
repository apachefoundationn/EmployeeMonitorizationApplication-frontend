import { Outlet } from 'react-router-dom'
import { Clock3 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="surface p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Time Tracking & Attendance
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Gems Groups .Since 2020.</div>
                </div>
              </div>
              <div className="mt-7 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    Gems Groups : Clock in Clock out 🫏.
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                 Your work matters; Every small effort adds up to something great.
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  Progress, not perfection; Keep moving forward.
                </div>
              </div>
              <div className="mt-8 text-xs text-slate-500 dark:text-slate-400">
                 Built on Trust..!
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

