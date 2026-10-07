import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import DataTablePage from '@/pages/DataTablePage'
import LoginPage from '@/pages/LoginPage'
import RegistrationPage from '@/pages/RegistrationPage'
import SearchPage from '@/pages/SearchPage'
import TodoPage from '@/pages/TodoPage'
import { ROUTES } from '@/routes/routes'

function App() {
  const { pathname } = useLocation()
  const wide = ROUTES.some((route) => route.wide && pathname.startsWith(route.path))
  const shell = 'mx-auto max-w-6xl px-4'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className={cn(shell, 'flex flex-col items-center gap-3 py-4')}>
          <h1>fe-interview-prep</h1>
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            {ROUTES.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-primary pb-1 font-medium text-primary'
                    : 'border-b-2 border-transparent pb-1 font-medium text-gray-600 hover:text-gray-900'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className={cn(shell, 'py-6')}>
        <div className={cn('rounded-lg border border-gray-200 bg-white p-6', !wide && 'mx-auto max-w-3xl')}>
          <Routes>
            <Route path="/" element={<Navigate to="/todo" replace />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/table" element={<DataTablePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
