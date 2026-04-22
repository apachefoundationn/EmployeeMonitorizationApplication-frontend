import { cn } from '../utils/cn.js'

function toDisplayValue(value) {
  if (value == null || value === '') return '—'
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') {
    if (typeof value.name === 'string') return value.name
    if (typeof value.label === 'string') return value.label
    if (typeof value.id === 'string' || typeof value.id === 'number') return String(value.id)
    return '—'
  }
  return String(value)
}

export function Table({ columns, rows, emptyLabel = 'No data found.', rowKey = 'id' }) {
  if (!rows?.length) {
    return (
      <div className="surface px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</div>
    )
  }

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn('px-4 py-3 font-semibold', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((r, index) => {
              const resolvedKey = typeof rowKey === 'function' ? rowKey(r, index) : r[rowKey]
              const safeKey =
                typeof resolvedKey === 'string' || typeof resolvedKey === 'number' ? resolvedKey : `row-${index}`

              return (
                <tr key={safeKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 text-slate-700 dark:text-slate-200', c.cellClassName)}>
                      {c.render ? c.render(r) : toDisplayValue(r[c.key])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

