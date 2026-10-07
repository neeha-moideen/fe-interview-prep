import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import DataTablePage from '@/pages/DataTablePage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import AdminPage from '@/pages/AdminPage'
import LoginPage from '@/pages/LoginPage'
import OrdersPage from '@/pages/OrdersPage'
import RegistrationPage from '@/pages/RegistrationPage'
import SearchPage from '@/pages/SearchPage'
import SessionLayout from '@/pages/SessionLayout'
import TodoPage from '@/pages/TodoPage'
import { ROUTES } from '@/routes/routes'

function App() {
  const { pathname } = useLocation()
  const current = ROUTES.find((route) => pathname.startsWith(route.path))
  const wide = current?.wide ?? false
  const shell = 'mx-auto max-w-6xl px-4'

  useEffect(() => {
    document.title = current
      ? `Q${current.question}: ${current.label} | Frontend Interview Prep`
      : 'Frontend Interview Prep'
  }, [current])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white shadow-xs">
        <div className={cn(shell, 'flex flex-col items-center gap-3 py-4')}>
          <h1 className="text-primary-dark">Frontend Interview Prep</h1>
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            {ROUTES.map(({ path, label, question }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-primary pb-1 font-medium text-primary'
                    : 'border-b-2 border-transparent pb-1 font-medium text-gray-600 hover:text-gray-900'
                }
              >
                <span className="rounded bg-primary-light px-1.5 py-0.5 text-xs font-semibold text-primary">
                  Q{question}
                </span>{' '}
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className={cn(shell, 'py-6')}>
        <div className={cn('rounded-xl border border-gray-200 bg-white p-6 shadow-sm', !wide && 'mx-auto max-w-3xl')}>
          <Routes>
            <Route path="/" element={<Navigate to="/todo" replace />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/table" element={<DataTablePage />} />
            <Route path="/session" element={<SessionLayout />}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="orders" element={<OrdersPage />} />
                <Route element={<ProtectedRoute role="admin" />}>
                  <Route path="admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
