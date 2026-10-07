export interface AppRoute {
  path: string
  label: string
  question: number
  wide?: boolean
}

export const ROUTES: readonly AppRoute[] = [
  { path: '/todo', label: 'Todo App', question: 1 },
  { path: '/search', label: 'Live Search', question: 2 },
  { path: '/register', label: 'Registration Wizard', question: 3 },
  { path: '/table', label: 'Data Table', question: 4, wide: true },
  { path: '/session', label: 'Login & Session', question: 5 },
]
