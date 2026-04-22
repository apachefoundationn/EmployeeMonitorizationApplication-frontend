import { LayoutDashboard, Clock, Users, Activity, FileText, ClipboardCheck, Building2 } from 'lucide-react'

export const navConfig = {
  employee: [
    { to: '/employee', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/attendance', label: 'Attendance', icon: Clock },
    { to: '/employee/teams', label: 'Teams', icon: Users },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/attendance', label: 'Attendance', icon: Activity },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/requests', label: 'Requests', icon: ClipboardCheck },
    { to: '/admin/teams', label: 'Teams', icon: Users },
  ],
  manager: [
    { to: '/employee', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/attendance', label: 'Attendance', icon: Clock },
    { to: '/employee/teams', label: 'Teams', icon: Users },
  ],
}

