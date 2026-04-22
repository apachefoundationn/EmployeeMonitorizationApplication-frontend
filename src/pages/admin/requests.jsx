import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Table } from '../../components/table.jsx'
import { Button } from '../../components/button.jsx'
import { Badge } from '../../components/badge.jsx'
import { useToast } from '../../context/toast.jsx'
import { formatHumanDate } from '../../utils/date.js'
import { api } from '../../utils/api.js'

export function AdminRequestsPage() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getCorrectionRequests()
      setRows(data || [])
    } catch (e) {
      toast.push({ title: 'Failed to load requests', message: e?.message ?? '', variant: 'danger' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function act(id, status) {
    try {
      await api.updateCorrectionRequestStatus(id, status)
      toast.push({ title: 'Request updated', message: `Marked as ${status}.`, variant: 'success' })
      load()
    } catch (e) {
      toast.push({ title: 'Update failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  const columns = useMemo(
    () => [
      { key: 'employee', header: 'Employee', render: (r) => r.employee?.name ?? '—' },
      { key: 'date', header: 'Date', render: (r) => formatHumanDate(r.date) },
      { key: 'reason', header: 'Reason' },
      { key: 'status', header: 'Status', render: (r) => <Badge>{String(r.status || '').replace(/^./, (m) => m.toUpperCase())}</Badge> },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" disabled={r.status !== 'pending'} onClick={() => act(r.id, 'approved')}>
              <Check className="h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="danger" disabled={r.status !== 'pending'} onClick={() => act(r.id, 'rejected')}>
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Correction requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 dark:text-slate-400">Review and process employee correction requests</div>
        </CardContent>
      </Card>

      <Table columns={columns} rows={loading ? [] : rows} emptyLabel={loading ? 'Loading…' : 'No requests found.'} />
    </div>
  )
}
