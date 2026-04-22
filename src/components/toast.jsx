import { X } from 'lucide-react'
import { cn } from '../utils/cn.js'

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'surface flex items-start justify-between gap-3 px-4 py-3',
            t.variant === 'success' && 'border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50',
            t.variant === 'danger' && 'border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-50',
          )}
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.message ? <div className="mt-0.5 text-sm opacity-90">{t.message}</div> : null}
          </div>
          <button
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

