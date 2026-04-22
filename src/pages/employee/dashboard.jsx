import { useEffect, useMemo, useState } from 'react'
import { Clock, LogIn, LogOut, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Button } from '../../components/button.jsx'
import { Modal } from '../../components/modal.jsx'
import { Input } from '../../components/input.jsx'
import { WeeklyHoursChart } from '../../components/charts/weekly-hours-chart.jsx'
import { useToast } from '../../context/toast.jsx'
import { api } from '../../utils/api.js'
import { Skeleton } from '../../components/skeleton.jsx'

function toUiAttendance(records) {
  return (records || [])
    .slice()
    .sort((a, b) => new Date(b.sign_in_time).getTime() - new Date(a.sign_in_time).getTime())
    .map((r) => {
      const signIn = r.sign_in_time ? new Date(r.sign_in_time) : null
      const signOut = r.sign_out_time ? new Date(r.sign_out_time) : null
      const date = signIn ? signIn.toISOString().slice(0, 10) : ''
      const checkIn = signIn ? signIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      const checkOut = signOut ? signOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      const totalHours = r.total_hours ?? 0
      const status = r.status ? r.status[0].toUpperCase() + r.status.slice(1) : 'Present'
      return { id: r.id, date, checkIn, checkOut, totalHours, status }
    })
}

function computeToday(att) {
  const today = att[0]
  const status = today?.status ?? 'Unknown'
  const hours = today?.totalHours ?? 0
  return { status, hours, checkIn: today?.checkIn, checkOut: today?.checkOut }
}

export function EmployeeDashboardPage() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [requestDate, setRequestDate] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [weeklyHours, setWeeklyHours] = useState(0)

  async function refresh() {
    setLoading(true)
    try {
      const [records, wh] = await Promise.all([api.myAttendance(), api.weeklyHours()])
      setAttendance(toUiAttendance(records))
      setWeeklyHours(wh?.totalWeeklyHours || 0)
    } catch (e) {
      toast.push({ title: 'Backend not reachable', message: e?.message ?? 'Using empty state.', variant: 'danger' })
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = useMemo(() => computeToday(attendance), [attendance])
  const weekly = useMemo(() => {
    const byDay = new Map()
    attendance.forEach((r) => {
      if (!r.date) return
      byDay.set(r.date, (byDay.get(r.date) || 0) + (Number(r.totalHours) || 0))
    })
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, hours]) => ({ day: new Date(`${date}T00:00:00`).toLocaleDateString([], { weekday: 'short' }), hours }))
  }, [attendance])

  async function onCheckIn() {
    try {
      await api.signIn()
      toast.push({ title: 'Checked in', message: 'Recorded successfully.', variant: 'success' })
      refresh()
    } catch (e) {
      toast.push({ title: 'Check-in failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onSubmitCorrection() {
    try {
      await api.createCorrectionRequest({ date: requestDate, reason: requestReason })
      toast.push({ title: 'Request submitted', message: 'Correction request created.', variant: 'success' })
      setOpen(false)
      setRequestDate('')
      setRequestReason('')
    } catch (e) {
      toast.push({ title: 'Request failed', message: e?.message ?? '', variant: 'danger' })
    }
  }
  async function onCheckOut() {
    try {
      await api.signOut()
      toast.push({ title: 'Checked out', message: 'Recorded successfully.', variant: 'success' })
      refresh()
    } catch (e) {
      toast.push({ title: 'Check-out failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {loading ? <Skeleton className="h-8 w-40" /> : today.status}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {today.checkIn ? `Check-in: ${today.checkIn}` : 'Not checked in'} •{' '}
                  {today.checkOut ? `Check-out: ${today.checkOut}` : 'Not checked out'}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Working hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? <Skeleton className="h-8 w-24" /> : `${today.hours}h`}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tracked for today</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? <Skeleton className="h-8 w-24" /> : `${weeklyHours} hrs`}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={onCheckIn}>
                <LogIn className="h-4 w-4" />
                Check-in
              </Button>
              <Button variant="secondary" onClick={onCheckOut}>
                <LogOut className="h-4 w-4" />
                Check-out
              </Button>
              <Button variant="ghost" onClick={() => setOpen(true)}>
                <Pencil className="h-4 w-4" />
                Request correction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <WeeklyHoursChart data={weekly} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        title="Request correction"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onSubmitCorrection}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input label="Date" type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
          <Input label="Reason" value={requestReason} onChange={(e) => setRequestReason(e.target.value)} placeholder="Explain what needs correction…" />
        </div>
      </Modal>
    </div>
  )
}

