import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Table } from '../../components/table.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'
import { Button } from '../../components/button.jsx'
import { Modal } from '../../components/modal.jsx'
import { Input } from '../../components/input.jsx'

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

export function EmployeeTeamsPage() {
  const toast = useToast()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const [respondTask, setRespondTask] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [responseAttachments, setResponseAttachments] = useState([])

  async function onRespond() {
    if (!respondTask) return
    try {
      let payload = { message: responseMessage }
      if (responseAttachments && responseAttachments.length > 0) {
        payload = new FormData()
        payload.append('message', responseMessage)
        Array.from(responseAttachments).forEach(file => payload.append('attachments', file))
      }
      await api.respondToTeamTask(respondTask.id, payload)
      toast.push({ title: 'Responded', message: 'Response submitted.', variant: 'success' })
      setRespondTask(null)
      setResponseMessage('')
      setResponseAttachments([])
      
      const data = await api.listTeams()
      setTeams(data || [])
    } catch (e) {
      toast.push({ title: 'Response failed', message: e?.message ?? '', variant: 'danger' })
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.listTeams()
        setTeams(data || [])
      } catch (e) {
        toast.push({ title: 'Failed to load teams', message: e?.message ?? '', variant: 'danger' })
        setTeams([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 dark:text-slate-400">View team members and assigned tasks. Editing is restricted for employee role.</div>
        </CardContent>
      </Card>
      {(loading ? [] : teams).map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table
                columns={[
                  { key: 'name', header: 'Member', render: (member) => member.user?.name ?? '—' },
                  { key: 'email', header: 'Email', render: (member) => member.user?.email ?? '—' },
                  { key: 'role', header: 'Role' },
                ]}
                rows={team.members || []}
                emptyLabel="No members found."
              />
              <Table
                columns={[
                  { key: 'taskName', header: 'Task Name' },
                  { key: 'description', header: 'Description', render: (task) => task.description || '—' },
                  { key: 'attachments', header: 'Attachments', render: (task) => <AttachmentList files={task.attachments} /> },
                  { key: 'responses', header: 'Responses', render: (task) => <ResponsesList responses={task.responses} /> },
                  { key: 'assigner', header: 'Assigned By', render: (task) => task.assigner?.name ?? `#${task.assignedBy}` },
                  { key: 'assignedAt', header: 'Assigned At', render: (task) => new Date(task.assignedAt).toLocaleString() },
                  { key: 'actions', header: 'Actions', render: (task) => <Button size="sm" onClick={() => setRespondTask(task)}>Respond</Button> },
                ]}
                rows={team.tasks || []}
                emptyLabel="No tasks assigned."
              />
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && !teams.length ? <div className="text-sm text-slate-500 dark:text-slate-400">No teams assigned yet.</div> : null}

      <Modal open={!!respondTask} title="Respond to Task" onClose={() => setRespondTask(null)} footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRespondTask(null)}>Cancel</Button>
          <Button onClick={onRespond}>Submit Response</Button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-3">
          <Input label="Message" value={responseMessage} onChange={(e) => setResponseMessage(e.target.value)} />
          <Input label="Attachments" type="file" multiple onChange={(e) => setResponseAttachments(e.target.files)} />
        </div>
      </Modal>
    </div>
  )
}
