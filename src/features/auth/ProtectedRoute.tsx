import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from './schemas'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  role?: Role
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <p role="status" className="py-6 text-center text-gray-500">
        Restoring your session...
      </p>
    )
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/session/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (role && user.role !== role) {
    return (
      <div role="alert" className="space-y-1 rounded-md border border-error p-4">
        <p className="font-medium text-error">403: You do not have access to this page</p>
        <p className="text-sm text-gray-600">This page is only available to {role}s.</p>
      </div>
    )
  }

  return <Outlet />
}
