import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Input } from '../../components/input.jsx'
import { Table } from '../../components/table.jsx'
import { Badge } from '../../components/badge.jsx'
import { formatHumanDate } from '../../utils/date.js'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'
import { getSession } from '../../utils/storage.js'

export function EmployeeAttendancePage() {
  const toast = useToast()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rowsRaw, setRowsRaw] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const records = await api.myAttendance()
        const mapped = (records || []).map((r) => {
          const signIn = r.sign_in_time ? new Date(r.sign_in_time) : null
          const signOut = r.sign_out_time ? new Date(r.sign_out_time) : null
          const date = signIn ? signIn.toISOString().slice(0, 10) : ''
          return {
            id: r.id,
            date,
            checkIn: signIn ? signIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            checkOut: signOut ? signOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            totalHours: r.total_hours ?? 0,
            status: r.status ? r.status[0].toUpperCase() + r.status.slice(1) : 'Present',
          }
        })
        setRowsRaw(mapped.sort((a, b) => (a.date < b.date ? 1 : -1)))
      } catch (e) {
        toast.push({ title: 'Failed to load attendance', message: e?.message ?? '', variant: 'danger' })
        setRowsRaw([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const rows = useMemo(() => {
    return rowsRaw
      .filter((r) => (from ? r.date >= from : true))
      .filter((r) => (to ? r.date <= to : true))
  }, [rowsRaw, from, to])

  const columns = useMemo(
    () => [
      { key: 'date', header: 'Date', render: (r) => formatHumanDate(r.date) },
      { key: 'checkIn', header: 'Check-in', render: (r) => r.checkIn ?? '—' },
      { key: 'checkOut', header: 'Check-out', render: (r) => r.checkOut ?? '—' },
      { key: 'totalHours', header: 'Total hours', render: (r) => (r.totalHours ? `${r.totalHours}h` : '—') },
      { key: 'status', header: 'Status', render: (r) => <Badge>{normalizeStatus(r.status)}</Badge> },
    ],
    [],
  )

  async function downloadXlsx() {
    try {
      const session = getSession()
      const token = session?.token
      const res = await fetch(api.downloadMyAttendanceXlsxUrl(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.push({ title: 'Downloaded', message: 'attendance.xlsx', variant: 'success' })
    } catch (e) {
      toast.push({ title: 'Download failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Filters</CardTitle>
            <Button variant="secondary" onClick={downloadXlsx}>
              Download XLSX
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={() => { setFrom(''); setTo('') }}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table
        columns={columns}
        rows={loading ? [] : rows}
        rowKey={(r) => r.id}
        emptyLabel={loading ? 'Loading…' : 'No attendance records for this range.'}
      />
    </div>
  )
}

function normalizeStatus(status) {
  if (status === 'Checked-in') return 'Present'
  if (status === 'Checked-out') return 'Present'
  return status
}

