import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Modal } from '../../components/modal.jsx'
import { Input, Select } from '../../components/input.jsx'
import { Table } from '../../components/table.jsx'
import { useToast } from '../../context/toast.jsx'
import { api } from '../../utils/api.js'

const DEFAULT_FORM = { name: '', email: '', password: '', department: '', role: 'employee' }

export function AdminEmployeesPage() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('add')
  const [selected, setSelected] = useState(null)
  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  const [form, setForm] = useState(DEFAULT_FORM)
  const departmentOptions = departments.map((department) => ({
    value: department.name,
    label: department.name,
  }))

  async function refresh() {
    setLoading(true)
    try {
      const response = await api.listUsers({ page, limit })
      const users = response?.items || []
      setRows(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department ?? '—',
          role: u.role,
        })),
      )
      setTotalPages(response?.totalPages || 1)
    } catch (e) {
      toast.push({ title: 'Failed to load users', message: e?.message ?? '', variant: 'danger' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [page])

  useEffect(() => {
    async function loadDepartments() {
      setLoadingDepartments(true)
      try {
        const response = await api.listDepartments()
        const list = (response || []).filter(Boolean)
        setDepartments(list)
        setForm((prev) => ({ ...prev, department: prev.department || list[0]?.name || '' }))
      } catch (e) {
        toast.push({ title: 'Failed to load departments', message: e?.message ?? '', variant: 'danger' })
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [toast])

  const columns = [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'department', header: 'Department' },
      { key: 'role', header: 'Role' },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEdit(r)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            {r.role !== 'admin' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDelete(r)}
                className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ]

  const title =
    mode === 'add' ? 'Add employee' : mode === 'edit' ? 'Edit employee' : 'Delete employee'

  function openAdd() {
    setSelected(null)
    setMode('add')
    setForm({ ...DEFAULT_FORM, department: departments[0]?.name || '' })
    setOpen(true)
  }

  async function openEdit(r) {
    setMode('edit')
    try {
      const current = await api.getUser(r.id)
      setSelected(current)
      setForm({
        name: current.name ?? '',
        email: current.email ?? '',
        password: '',
        department: current.department ?? departments[0]?.name ?? '',
        role: current.role ?? 'employee',
      })
      setOpen(true)
    } catch (e) {
      toast.push({ title: 'Failed to load employee', message: e?.message ?? '', variant: 'danger' })
    }
  }

  function openDelete(r) {
    setSelected(r)
    setMode('delete')
    setOpen(true)
  }

  async function onSave() {
    try {
      if (mode === 'add') {
        if (!form.password) throw new Error('Password is required for new users.')
        await api.createUser(form)
        toast.push({ title: 'Created', message: 'User created successfully.', variant: 'success' })
      } else if (mode === 'edit') {
        await api.updateUser(selected.id, { name: form.name, email: form.email, department: form.department, role: form.role })
        toast.push({ title: 'Updated', message: 'User updated successfully.', variant: 'success' })
      }
      setOpen(false)
      setForm({ ...DEFAULT_FORM, department: departments[0]?.name || '' })
      setSelected(null)
      refresh()
    } catch (e) {
      toast.push({ title: 'Save failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onDelete() {
    try {
      await api.deleteUser(selected.id)
      toast.push({ title: 'Deleted', message: 'User deleted successfully.', variant: 'success' })
      setOpen(false)
      setSelected(null)
      refresh()
    } catch (e) {
      toast.push({ title: 'Delete failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Employee management</CardTitle>
            <Button
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              Add employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 dark:text-slate-400">Manage employees</div>
        </CardContent>
      </Card>

      <Table columns={columns} rows={loading ? [] : rows} emptyLabel={loading ? 'Loading…' : 'No employees found.'} />
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <div className="text-sm text-slate-600 dark:text-slate-300">{`Page ${page} of ${totalPages}`}</div>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      <Modal
        open={open}
        title={title}
        onClose={() => {
          setOpen(false)
          setSelected(null)
          setForm({ ...DEFAULT_FORM, department: departments[0]?.name || '' })
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={mode === 'delete' ? 'danger' : 'primary'}
              onClick={() => {
                if (mode === 'delete') return onDelete()
                return onSave()
              }}
            >
              {mode === 'delete' ? 'Delete' : 'Save'}
            </Button>
          </div>
        }
      >
        {mode === 'delete' ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Delete <span className="font-semibold">{selected?.name}</span>?
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            <Input label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="name@company.com" />
            {mode === 'add' ? (
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            ) : null}
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              options={departmentOptions.length ? departmentOptions : [{ value: '', label: 'No departments' }]}
              disabled={loadingDepartments || !departments.length}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

