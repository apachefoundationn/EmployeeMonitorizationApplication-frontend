import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/auth-layout.jsx'
import { DashboardLayout } from '../layouts/dashboard-layout.jsx'
import { ProtectedRoute } from './protected-route.jsx'
import { useAuth } from '../context/auth.jsx'
import { roles } from '../constants/roles.js'

import { LoginPage } from '../pages/auth/login.jsx'
import { SignupPage } from '../pages/auth/signup.jsx'
import { UnauthorizedPage } from '../pages/misc/unauthorized.jsx'
import { NotFoundPage } from '../pages/misc/not-found.jsx'

import { EmployeeDashboardPage } from '../pages/employee/dashboard.jsx'
import { EmployeeAttendancePage } from '../pages/employee/attendance.jsx'
import { EmployeeTeamsPage } from '../pages/employee/teams.jsx'

import { AdminDashboardPage } from '../pages/admin/dashboard.jsx'
import { AdminEmployeesPage } from '../pages/admin/employees.jsx'
import { AdminDepartmentsPage } from '../pages/admin/departments.jsx'
import { AdminAttendancePage } from '../pages/admin/attendance.jsx'
import { AdminReportsPage } from '../pages/admin/reports.jsx'
import { AdminRequestsPage } from '../pages/admin/requests.jsx'
import { AdminTeamsPage } from '../pages/admin/teams.jsx'

function DefaultRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === roles.admin) return <Navigate to="/admin" replace />
  if (user.role === roles.manager) return <Navigate to="/employee" replace />
  return <Navigate to="/employee" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute allowRoles={[roles.employee, roles.admin, roles.manager]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DefaultRedirect />} />

          <Route element={<ProtectedRoute allowRoles={[roles.employee, roles.manager]} />}>
            <Route path="/employee" element={<EmployeeDashboardPage />} />
            <Route path="/employee/attendance" element={<EmployeeAttendancePage />} />
            <Route path="/employee/teams" element={<EmployeeTeamsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowRoles={[roles.admin]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/employees" element={<AdminEmployeesPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
            <Route path="/admin/teams" element={<AdminTeamsPage />} />
          </Route>

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

