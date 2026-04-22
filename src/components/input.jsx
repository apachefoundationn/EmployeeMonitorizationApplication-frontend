import { cn } from '../utils/cn.js'

function normalizeOption(option, index) {
  if (option && typeof option === 'object') {
    const rawValue = option.value ?? option.id ?? index
    const rawLabel = option.label ?? option.name ?? option.value ?? option.id ?? `Option ${index + 1}`
    return {
      value: typeof rawValue === 'string' || typeof rawValue === 'number' ? String(rawValue) : String(index),
      label: typeof rawLabel === 'string' || typeof rawLabel === 'number' ? String(rawLabel) : `Option ${index + 1}`,
    }
  }

  return {
    value: option == null ? '' : String(option),
    label: option == null ? '—' : String(option),
  }
}

export function Input({ className, label, hint, error, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div> : null}
      <input
        className={cn(
          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-900 dark:focus:ring-rose-950/50',
          className,
        )}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div> : null}
      {error ? <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</div> : null}
    </label>
  )
}

export function Select({ className, label, options, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div> : null}
      <select
        className={cn(
          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-700 dark:focus:ring-slate-800',
          className,
        )}
        {...props}
      >
        {options.map((option, index) => {
          const normalized = normalizeOption(option, index)
          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          )
        })}
      </select>
    </label>
  )
}

