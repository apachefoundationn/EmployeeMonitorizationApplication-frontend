import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/sidebar.jsx'
import { Topbar } from '../components/navigation/topbar.jsx'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 px-4 pb-10 pt-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

