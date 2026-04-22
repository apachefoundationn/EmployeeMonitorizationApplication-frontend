import { getSession, setSession, clearSession } from './storage.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch(path, { method = 'GET', headers, body, auth = true } = {}) {
  const session = getSession()
  const token = session?.token

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'message' in data ? data.message : `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data
  }
  return data
}

export async function apiFetchFormData(path, { method = 'POST', headers, body, auth = true } = {}) {
  const session = getSession()
  const token = session?.token

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'message' in data ? data.message : `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data
  }
  return data
}

export const api = {
  async register({ name, email, password }) {
    const data = await apiFetch('/api/auth/register', { method: 'POST', auth: false, body: { name, email, password } })
    return data
  },
  async login({ email, password }) {
    const data = await apiFetch('/api/auth/login', { method: 'POST', auth: false, body: { email, password } })
    setSession({ token: data.token, user: data.user })
    return data.user
  },
  async me() {
    const user = await apiFetch('/api/auth/me')
    const session = getSession()
    if (session?.token) setSession({ token: session.token, user })
    return user
  },
  logout() {
    clearSession()
  },

  // Admin user management
  async listUsers({ page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    return await apiFetch(`/api/users?${params.toString()}`)
  },
  async getUser(id) {
    return await apiFetch(`/api/users/${id}`)
  },
  async createUser({ name, email, password, role, department }) {
    const created = await apiFetch('/api/users', {
      method: 'POST',
      body: { name, email, password, role, department },
    })
    return created
  },
  async updateUser(id, patch) {
    return await apiFetch(`/api/users/${id}`, { method: 'PUT', body: patch })
  },
  async deleteUser(id) {
    return await apiFetch(`/api/users/${id}`, { method: 'DELETE' })
  },
  async listDepartments() {
    return await apiFetch('/api/departments')
  },
  async createDepartment(payload) {
    return await apiFetch('/api/departments', { method: 'POST', body: payload })
  },
  async updateDepartment(id, payload) {
    return await apiFetch(`/api/departments/${id}`, { method: 'PUT', body: payload })
  },
  async deleteDepartment(id) {
    return await apiFetch(`/api/departments/${id}`, { method: 'DELETE' })
  },

  // Admin dashboards / reports
  async adminDashboard({ date } = {}) {
    const q = date ? `?date=${encodeURIComponent(date)}` : ''
    return await apiFetch(`/api/admin/dashboard${q}`)
  },
  async adminAttendance({ department = 'all', date } = {}) {
    const params = new URLSearchParams()
    if (department) params.set('department', department)
    if (date) params.set('date', date)
    const q = params.toString()
    return await apiFetch(`/api/admin/attendance${q ? `?${q}` : ''}`)
  },
  async adminWeeklyReport({ start, end } = {}) {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    const q = params.toString()
    return await apiFetch(`/api/admin/reports/weekly${q ? `?${q}` : ''}`)
  },
  async adminMonthlyReport({ year, month } = {}) {
    const params = new URLSearchParams()
    if (year) params.set('year', String(year))
    if (month) params.set('month', String(month))
    const q = params.toString()
    return await apiFetch(`/api/admin/reports/monthly${q ? `?${q}` : ''}`)
  },
  adminExportUrl({ start, end, department = 'all' } = {}) {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    if (department) params.set('department', department)
    const q = params.toString()
    return `${BASE_URL}/api/admin/reports/export${q ? `?${q}` : ''}`
  },

  // Attendance (employee)
  async myAttendance() {
    return await apiFetch('/api/attendance/me')
  },
  async teamAttendance() {
    return await apiFetch('/api/attendance/team')
  },
  async signIn() {
    return await apiFetch('/api/attendance/sign-in', { method: 'POST' })
  },
  async signOut() {
    return await apiFetch('/api/attendance/sign-out', { method: 'POST' })
  },
  async weeklyHours() {
    return await apiFetch('/api/attendance/weekly-hours')
  },
  downloadMyAttendanceXlsxUrl() {
    return `${BASE_URL}/api/attendance/mepdf`
  },
  async createCorrectionRequest({ date, reason }) {
    return await apiFetch('/api/correction-requests', { method: 'POST', body: { date, reason } })
  },
  async getCorrectionRequests({ status } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    const q = params.toString()
    return await apiFetch(`/api/correction-requests${q ? `?${q}` : ''}`)
  },
  async updateCorrectionRequestStatus(id, status) {
    return await apiFetch(`/api/correction-requests/${id}/status`, { method: 'PATCH', body: { status } })
  },
  async approveCorrectionRequest(id) {
    return await apiFetch(`/api/correction-requests/${id}/approve`, { method: 'POST' })
  },
  async rejectCorrectionRequest(id) {
    return await apiFetch(`/api/correction-requests/${id}/reject`, { method: 'POST' })
  },
  async listUserOptions() {
    return await apiFetch('/api/users/options')
  },
  async listTeams() {
    return await apiFetch('/api/teams')
  },
  async createTeam(payload) {
    return await apiFetch('/api/teams', { method: 'POST', body: payload })
  },
  async updateTeam(id, payload) {
    return await apiFetch(`/api/teams/${id}`, { method: 'PUT', body: payload })
  },
  async deleteTeam(id) {
    return await apiFetch(`/api/teams/${id}`, { method: 'DELETE' })
  },
  async addTeamMember(teamId, payload) {
    return await apiFetch(`/api/teams/${teamId}/members`, { method: 'POST', body: { ...payload, teamId: Number(teamId) } })
  },
  async removeTeamMember(teamId, userId) {
    return await apiFetch(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' })
  },
  async assignTeamTask(teamId, payload) {
    if (payload instanceof FormData) {
      return await apiFetchFormData(`/api/teams/${teamId}/tasks`, { method: 'POST', body: payload })
    }
    return await apiFetch(`/api/teams/${teamId}/tasks`, { method: 'POST', body: payload })
  },
  async listTeamTasks(teamId) {
    return await apiFetch(`/api/teams/${teamId}/tasks`)
  },
  async respondToTeamTask(taskId, payload) {
    if (payload instanceof FormData) {
      return await apiFetchFormData(`/api/teams/tasks/${taskId}/respond`, { method: 'POST', body: payload })
    }
    return await apiFetch(`/api/teams/tasks/${taskId}/respond`, { method: 'POST', body: payload })
  },
}

