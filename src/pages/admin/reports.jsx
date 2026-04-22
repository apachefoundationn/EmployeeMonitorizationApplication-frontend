import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { AdminAttendanceBar } from '../../components/charts/admin-attendance-charts.jsx'
import { useToast } from '../../context/toast.jsx'
import { api } from '../../utils/api.js'
import { Input, Select } from '../../components/input.jsx'
import { getSession } from '../../utils/storage.js'
import { Skeleton } from '../../components/skeleton.jsx'

export function AdminReportsPage() {
  const toast = useToast()
  const now = useMemo(() => new Date(), [])
  const [department, setDepartment] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthly, setMonthly] = useState([])
  const departmentOptions = useMemo(
    () => [{ value: 'all', label: 'All' }, ...departments.map((department) => ({ value: department.name, label: department.name }))],
    [departments],
  )

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
        const data = await api.adminMonthlyReport({ year: now.getFullYear(), month: now.getMonth() + 1 })
        setMonthly(data)
      } catch (e) {
        toast.push({ title: 'Failed to load reports', message: e?.message ?? '', variant: 'danger' })
        setMonthly([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [now, toast])

  async function download() {
    try {
      const session = getSession()
      const token = session?.token
      const url = api.adminExportUrl({ start: from || undefined, end: to || undefined, department })
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'attendance-report.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
      toast.push({ title: 'Downloaded', message: 'attendance-report.xlsx', variant: 'success' })
    } catch (e) {
      toast.push({ title: 'Download failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Reports</CardTitle>
            <Button
              onClick={download}
            >
              <Download className="h-4 w-4" />
              Download report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departmentOptions}
            />
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <div />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64 w-full" /> : <AdminAttendanceBar data={monthly} />}
        </CardContent>
      </Card>
    </div>
  )
}

