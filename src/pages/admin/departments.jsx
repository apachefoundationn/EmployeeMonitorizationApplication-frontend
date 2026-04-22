import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Input } from '../../components/input.jsx'
import { Modal } from '../../components/modal.jsx'
import { Table } from '../../components/table.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'

const EMPTY_FORM = { name: '', descr: '' }

export function AdminDepartmentsPage() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    setLoading(true)
    try {
      const data = await api.listDepartments()
      setRows(data || [])
    } catch (e) {
      toast.push({ title: 'Failed to load departments', message: e?.message ?? '', variant: 'danger' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      { key: 'descr', header: 'Description', render: (department) => department.descr || '—' },
      {
        key: 'actions',
        header: 'Actions',
        render: (department) => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => openEdit(department)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openDelete(department)}
              className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  function closeModal() {
    setOpen(false)
    setSelected(null)
    setForm(EMPTY_FORM)
  }

  function openCreate() {
    setMode('create')
    setSelected(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(department) {
    setMode('edit')
    setSelected(department)
    setForm({ name: department.name ?? '', descr: department.descr ?? '' })
    setOpen(true)
  }

  function openDelete(department) {
    setMode('delete')
    setSelected(department)
    setOpen(true)
  }

  async function submit() {
    try {
      if (mode === 'create') {
        await api.createDepartment(form)
        toast.push({ title: 'Department created', message: form.name, variant: 'success' })
      } else if (mode === 'edit' && selected) {
        await api.updateDepartment(selected.id, form)
        toast.push({ title: 'Department updated', message: form.name, variant: 'success' })
      } else if (mode === 'delete' && selected) {
        await api.deleteDepartment(selected.id)
        toast.push({ title: 'Department deleted', message: selected.name, variant: 'success' })
      }

      closeModal()
      load()
    } catch (e) {
      toast.push({ title: 'Department action failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Departments</CardTitle>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 dark:text-slate-400">Create and manage departments used across users and teams.</div>
        </CardContent>
      </Card>

      <Table columns={columns} rows={loading ? [] : rows} emptyLabel={loading ? 'Loading…' : 'No departments found.'} />

      <Modal
        open={open}
        title={mode === 'create' ? 'Create department' : mode === 'edit' ? 'Edit department' : 'Delete department'}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant={mode === 'delete' ? 'danger' : 'primary'} onClick={submit}>
              {mode === 'delete' ? 'Delete' : 'Save'}
            </Button>
          </div>
        }
      >
        {mode === 'delete' ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">Delete <span className="font-semibold">{selected?.name}</span>?</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <Input label="Description" value={form.descr} onChange={(e) => setForm((current) => ({ ...current, descr: e.target.value }))} />
          </div>
        )}
      </Modal>
    </div>
  )
}
