import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import DataTablePage from '@/pages/DataTablePage'
import LoginPage from '@/pages/LoginPage'
import RegistrationPage from '@/pages/RegistrationPage'
import SearchPage from '@/pages/SearchPage'
import TodoPage from '@/pages/TodoPage'
import { ROUTES } from '@/routes/routes'

function App() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">fe-interview-prep</h1>
      <nav className="my-4 flex gap-4">
        {ROUTES.map(({ path, label }) => (
          <NavLink key={path} to={path} className="underline">
            {label}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/todo" replace />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/table" element={<DataTablePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
