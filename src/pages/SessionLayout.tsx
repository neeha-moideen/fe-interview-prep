import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import AuthProvider from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'

function SessionShell() {
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/session/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('border-b-2 pb-1 font-medium', isActive ? 'border-primary text-primary' : 'border-transparent text-gray-600')

  return (
    <div className="space-y-6">
      <h2>Q5: Login & Session Handling</h2>
      {status === 'authenticated' && user && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <nav aria-label="Session" className="flex gap-4 text-sm">
            <NavLink to="/session/orders" className={linkClass}>
              Orders
            </NavLink>
            {user.role === 'admin' && (
              <NavLink to="/session/admin" className={linkClass}>
                Admin stats
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span>
              Signed in as <strong>{user.name}</strong> ({user.role})
            </span>
            <Button variant="secondary" size="sm" onClick={() => void handleLogout()}>
              Log out
            </Button>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  )
}

export default function SessionLayout() {
  return (
    <AuthProvider>
      <SessionShell />
    </AuthProvider>
  )
}
