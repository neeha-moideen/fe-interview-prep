export interface AppRoute {
  path: string
  label: string
  wide?: boolean
}

export const ROUTES: readonly AppRoute[] = [
  { path: '/todo', label: 'Todo App' },
  { path: '/search', label: 'Live Search' },
  { path: '/register', label: 'Registration Wizard' },
  { path: '/table', label: 'Data Table', wide: true },
  { path: '/login', label: 'Login & Session' },
]
