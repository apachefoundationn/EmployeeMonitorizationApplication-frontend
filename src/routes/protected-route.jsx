import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import { Skeleton } from '../components/skeleton.jsx'

export function ProtectedRoute({ allowRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowRoles?.length && !allowRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

