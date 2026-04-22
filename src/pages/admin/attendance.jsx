import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Input, Select } from '../../components/input.jsx'
import { Table } from '../../components/table.jsx'
import { Badge } from '../../components/badge.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'

export function AdminAttendancePage() {
  const toast = useToast()
  const [dept, setDept] = useState('all')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const departmentOptions = useMemo(
    () => [{ value: 'all', label: 'All' }, ...departments.map((department) => ({ value: department.name, label: department.name }))],
    [departments],
  )

  const [rowsRaw, setRowsRaw] = useState([])

  const rows = useMemo(() => {
    return rowsRaw.map((r) => ({
      id: r.id,
      name: r.user?.name ?? '—',
      department: r.user?.department ?? '—',
      checkIn: r.sign_in_time ? new Date(r.sign_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      status: r.status ? r.status[0].toUpperCase() + r.status.slice(1) : 'Present',
    }))
  }, [rowsRaw])

  useEffect(() => {
    async function loadDepartments() {
      try {
        const list = await api.listDepartments()
        setDepartments(list || [])
      } catch (e) {
        toast.push({ title: 'Failed to load departments', message: e?.message ?? '', variant: 'danger' })
      }
    }
    loadDepartments()
  }, [toast])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.adminAttendance({ department: dept, date: date || undefined })
        setRowsRaw(data)
      } catch (e) {
        toast.push({ title: 'Failed to load attendance', message: e?.message ?? '', variant: 'danger' })
        setRowsRaw([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dept, date, toast])

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Employee' },
      { key: 'department', header: 'Department' },
      { key: 'checkIn', header: 'Check-in', render: (r) => r.checkIn ?? '—' },
      { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              label="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              options={departmentOptions}
            />
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div />
          </div>
        </CardContent>
      </Card>

      <Table columns={columns} rows={loading ? [] : rows} emptyLabel={loading ? 'Loading…' : 'No records for this filter.'} />
    </div>
  )
}

