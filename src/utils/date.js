export function formatISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, deltaDays) {
  const d = new Date(date)
  d.setDate(d.getDate() + deltaDays)
  return d
}

export function formatHumanDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
}

