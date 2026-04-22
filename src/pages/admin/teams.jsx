import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, UserMinus, Users } from 'lucide-react'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Input, Select } from '../../components/input.jsx'
import { Modal } from '../../components/modal.jsx'
import { Table } from '../../components/table.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'
import { useAuth } from '../../context/auth.jsx'

const EMPTY_TEAM_FORM = { name: '', description: '', managerId: '' }
const EMPTY_MEMBER_FORM = { userId: '' }
const EMPTY_TASK_FORM = { taskName: '', description: '', attachments: [] }

function AttachmentList({ files }) {
  if (!files || !files.length) return '—'
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((url, i) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i)
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i)
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        if (isImage) return <img key={i} src={`${baseUrl}${url}`} alt="attachment" className="h-16 w-16 object-cover rounded" />
        if (isVideo) return <video key={i} src={`${baseUrl}${url}`} controls className="h-16 w-24 object-cover rounded" />
        return <a key={i} href={`${baseUrl}${url}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">File {i+1}</a>
      })}
    </div>
  )
}

function ResponsesList({ responses }) {
  if (!responses || !responses.length) return '—'
  return (
    <div className="flex flex-col gap-2 text-sm">
      {responses.map((r) => (
        <div key={r.id} className="border-l-2 pl-2">
          <div className="font-semibold">{r.user?.name}</div>
          <div>{r.message}</div>
          <AttachmentList files={r.attachments} />
        </div>
      ))}
    </div>
  )
}

export function AdminTeamsPage() {
  const toast = useToast()
  const { user: adminUser } = useAuth()
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM_FORM)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER_FORM)
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM)

  async function loadData() {
    setLoading(true)
    try {
      const [teamData, userData] = await Promise.all([api.listTeams(), api.listUserOptions()])
      setTeams(teamData || [])
      setUsers(userData || [])
      setSelectedTeam((current) => (current ? (teamData || []).find((team) => team.id === current.id) ?? null : null))
    } catch (e) {
      toast.push({ title: 'Failed to load teams', message: e?.message ?? '', variant: 'danger' })
      setTeams([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const rows = useMemo(
    () =>
      teams.map((team) => ({
        ...team,
        memberCount: team.members?.length ?? 0,
        taskCount: team.tasks?.length ?? 0,
      })),
    [teams],
  )

  const columns = [
    { key: 'name', header: 'Team' },
    { key: 'description', header: 'Description', render: (team) => team.description || '—' },
    { key: 'memberCount', header: 'Members' },
    { key: 'taskCount', header: 'Tasks' },
    {
      key: 'actions',
      header: 'Actions',
      render: (team) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(team)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openManage(team)}>
            <Users className="h-4 w-4" />
            Members & Tasks
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(team.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  function openEdit(team) {
    setMode('edit')
    setSelectedTeam(team)
    setTeamForm({ name: team.name ?? '', description: team.description ?? '', managerId: team.managerId ? String(team.managerId) : '' })
    setTeamModalOpen(true)
  }

  function openCreate() {
    setMode('create')
    setTeamForm(EMPTY_TEAM_FORM)
    setTeamModalOpen(true)
  }

  function openManage(team) {
    setSelectedTeam(team)
    setMemberForm(EMPTY_MEMBER_FORM)
    setTaskForm(EMPTY_TASK_FORM)
  }

  async function onSaveTeam() {
    try {
      // If no manager is explicitly chosen, fall back to the current admin's ID
      // so the FK constraint (managerId is not nullable in DB) is always satisfied
      const resolvedManagerId = teamForm.managerId || String(adminUser?.id || '')
      const payload = { ...teamForm, managerId: resolvedManagerId }
      if (mode === 'create') {
        await api.createTeam(payload)
      } else if (selectedTeam) {
        await api.updateTeam(selectedTeam.id, payload)
      }
      setTeamModalOpen(false)
      setTeamForm(EMPTY_TEAM_FORM)
      await loadData()
      toast.push({ title: 'Saved', message: 'Team updated successfully.', variant: 'success' })
    } catch (e) {
      toast.push({ title: 'Team save failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onDelete(teamId) {
    try {
      await api.deleteTeam(teamId)
      await loadData()
      toast.push({ title: 'Deleted', message: 'Team deleted successfully.', variant: 'success' })
    } catch (e) {
      toast.push({ title: 'Delete failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onAddMember() {
    if (!selectedTeam || !memberForm.userId) return
    try {
      const updatedTeam = await api.addTeamMember(selectedTeam.id, { userId: Number(memberForm.userId) })
      setTeams((current) => current.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
      setSelectedTeam(updatedTeam)
      setMemberForm(EMPTY_MEMBER_FORM)
    } catch (e) {
      toast.push({ title: 'Add member failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onRemoveMember(userId) {
    if (!selectedTeam) return
    try {
      const updatedTeam = await api.removeTeamMember(selectedTeam.id, userId)
      setTeams((current) => current.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
      setSelectedTeam(updatedTeam)
    } catch (e) {
      toast.push({ title: 'Remove member failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  async function onAssignTask() {
    if (!selectedTeam) return
    if (!taskForm.taskName.trim()) {
      toast.push({ title: 'Task Name is required', message: 'Please provide a task name.', variant: 'danger' })
      return
    }
    try {
      let payload = { taskName: taskForm.taskName, description: taskForm.description }
      if (taskForm.attachments && taskForm.attachments.length > 0) {
        payload = new FormData()
        payload.append('taskName', taskForm.taskName)
        payload.append('description', taskForm.description)
        Array.from(taskForm.attachments).forEach(file => {
          payload.append('attachments', file)
        })
      }
      const task = await api.assignTeamTask(selectedTeam.id, payload)
      const updatedTeam = { ...selectedTeam, tasks: [task, ...(selectedTeam.tasks || [])] }
      setTeams((current) => current.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
      setSelectedTeam(updatedTeam)
      setTaskForm(EMPTY_TASK_FORM)
      if (task.managerNotification) {
        toast.push({
          title: 'Manager notified',
          message: `${task.managerNotification.taskTitle} shared with manager for ${task.managerNotification.assignedTeamName}.`,
          variant: 'success',
        })
      }
    } catch (e) {
      toast.push({ title: 'Assign task failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  const availableUsers = useMemo(() => {
    const currentIds = new Set((selectedTeam?.members || []).map((member) => member.userId))
    const teamManagerId = selectedTeam?.managerId ?? null
    return users
      .filter((user) => !currentIds.has(user.id))
      .filter((user) => user.role !== 'admin')
      .filter((user) => !teamManagerId || user.id !== teamManagerId)
      .map((user) => ({ value: String(user.id), label: `${user.name} (${user.email}) - ${user.role}` }))
  }, [selectedTeam, users])

  const managerOptions = useMemo(() => {
    const options = users
      .filter((user) => user.role === 'manager')
      .map((user) => ({ value: String(user.id), label: `${user.name} (${user.email})` }))
    // 'No manager' uses admin as FK placeholder — label clarifies this to the user
    const adminLabel = adminUser ? `No manager (Admin: ${adminUser.name})` : 'No manager assigned (Admin)'
    return [{ value: '', label: adminLabel }, ...options]
  }, [users, adminUser])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teams Management</CardTitle>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admin can create, edit, delete teams, manage members, and assign team tasks.</div>
        </CardContent>
      </Card>

      <Table columns={columns} rows={loading ? [] : rows} emptyLabel={loading ? 'Loading…' : 'No teams found.'} />

      {selectedTeam ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTeam.name} - Members & Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Select
                  label="User"
                  value={memberForm.userId}
                  onChange={(e) => setMemberForm((current) => ({ ...current, userId: e.target.value }))}
                  options={availableUsers.length ? availableUsers : [{ value: '', label: 'No available users' }]}
                  disabled={!availableUsers.length}
                />
                <div className="flex items-end">
                  <Button onClick={onAddMember} disabled={!memberForm.userId}>
                    Add Member
                  </Button>
                </div>
              </div>
              <Table
                columns={[
                  { key: 'name', header: 'Member', render: (member) => member.user?.name ?? '—' },
                  { key: 'email', header: 'Email', render: (member) => member.user?.email ?? '—' },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (member) => (
                      <Button size="sm" variant="danger" onClick={() => onRemoveMember(member.userId)}>
                        <UserMinus className="h-4 w-4" />
                        Remove
                      </Button>
                    ),
                  },
                ]}
                rows={selectedTeam.members || []}
                emptyLabel="No members."
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Input
                  label="Task Name"
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm((current) => ({ ...current, taskName: e.target.value }))}
                  placeholder="Enter task name"
                />
                <Input
                  label="Description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Enter task description"
                />
                <Input
                  label="Attachments"
                  type="file"
                  multiple
                  onChange={(e) => setTaskForm((current) => ({ ...current, attachments: e.target.files }))}
                />
                <div className="flex items-end">
                  <Button onClick={onAssignTask}>Assign Task</Button>
                </div>
              </div>
              <Table
                columns={[
                  { key: 'taskName', header: 'Task Name' },
                  { key: 'description', header: 'Description', render: (task) => task.description || '—' },
                  { key: 'attachments', header: 'Attachments', render: (task) => <AttachmentList files={task.attachments} /> },
                  { key: 'responses', header: 'Responses', render: (task) => <ResponsesList responses={task.responses} /> },
                  { key: 'assigner', header: 'Assigned By', render: (task) => task.assigner?.name ?? `#${task.assignedBy}` },
                  { key: 'assignedAt', header: 'Assigned At', render: (task) => new Date(task.assignedAt).toLocaleString() },
                ]}
                rows={selectedTeam.tasks || []}
                emptyLabel="No tasks."
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Modal
        open={teamModalOpen}
        title={mode === 'create' ? 'Create team' : 'Edit team'}
        onClose={() => setTeamModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveTeam}>Save</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <Input label="Name" value={teamForm.name} onChange={(e) => setTeamForm((current) => ({ ...current, name: e.target.value }))} />
          <Input
            label="Description"
            value={teamForm.description}
            onChange={(e) => setTeamForm((current) => ({ ...current, description: e.target.value }))}
          />
          <Select
            label="Manager"
            value={teamForm.managerId}
            onChange={(e) => setTeamForm((current) => ({ ...current, managerId: e.target.value }))}
            options={managerOptions}
          />
        </div>
      </Modal>
    </div>
  )
}
