import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import DataTablePage from '@/pages/DataTablePage'
import LoginPage from '@/pages/LoginPage'
import RegistrationPage from '@/pages/RegistrationPage'
import SearchPage from '@/pages/SearchPage'
import TodoPage from '@/pages/TodoPage'
import { ROUTES } from '@/routes/routes'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
          <h1>fe-interview-prep</h1>
          <nav className="flex flex-wrap gap-4 text-sm">
            {ROUTES.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-primary pb-1 font-medium text-primary'
                    : 'border-b-2 border-transparent pb-1 text-gray-600 hover:text-gray-900'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
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
