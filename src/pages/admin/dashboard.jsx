import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { AdminAttendanceBar, AdminAttendanceLine } from '../../components/charts/admin-attendance-charts.jsx'
import { api } from '../../utils/api.js'
import { Skeleton } from '../../components/skeleton.jsx'
import { useToast } from '../../context/toast.jsx'

export function AdminDashboardPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.adminDashboard()
        setStats(data.stats)
        setTrend(toChart(data.trend))
      } catch (e) {
        toast.push({ title: 'Failed to load dashboard', message: e?.message ?? '', variant: 'danger' })
        setStats(null)
        setTrend([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const statCards = useMemo(() => {
    const s = stats
    return [
      { label: 'Total employees', value: s?.totalEmployees ?? 0 },
      { label: 'Active today', value: s?.activeToday ?? 0 },
      { label: 'Absent today', value: s?.absentToday ?? 0 },
    ]
  }, [stats])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle>{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {loading ? <Skeleton className="h-9 w-20" /> : s.value}
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Updated live</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : <AdminAttendanceLine data={trend} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : <AdminAttendanceBar data={trend} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function toChart(trend) {
  return (trend || []).map((r) => ({
    label: r.day?.slice(5) ?? r.day,
    present: r.present ?? 0,
    absent: r.absent ?? 0,
  }))
}

