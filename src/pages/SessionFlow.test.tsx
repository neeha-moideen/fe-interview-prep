import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { resetApiClient } from '@/features/auth/apiClient'
import { createTestBackend } from '@/mock/testHarness'

let harness: ReturnType<typeof createTestBackend>

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

async function signInAs(username: string, password = `${username}123`) {
  await userEvent.type(await screen.findByLabelText('Username'), username)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('login and session flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    harness = createTestBackend()
    vi.stubGlobal('fetch', harness.fake.fetch)
    resetApiClient()
  })
  afterEach(() => {
    resetApiClient()
    vi.unstubAllGlobals()
  })

  it('sends a logged-out user to the login page and shows an error for wrong credentials', async () => {
    renderApp('/session/orders')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    await signInAs('user', 'wrong-password')

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password')
    expect(screen.queryByRole('heading', { name: 'Your orders' })).not.toBeInTheDocument()
  })

  it('takes the user back to the page they asked for after logging in', async () => {
    renderApp('/session/admin')
    await signInAs('admin')

    expect(await screen.findByRole('heading', { name: 'Platform stats' })).toBeInTheDocument()
    expect(await screen.findByText('Total orders')).toBeInTheDocument()
  })

  it('opens the orders page after a plain login', async () => {
    renderApp('/session/login')
    await signInAs('user')

    expect(await screen.findByRole('heading', { name: 'Your orders' })).toBeInTheDocument()
    expect(await screen.findByText('Laptop stand')).toBeInTheDocument()
    expect(screen.getByText(/Signed in as/)).toHaveTextContent('Asha Rao')
  })

  it('keeps the admin page away from regular users', async () => {
    renderApp('/session/admin')
    await signInAs('user')

    expect(await screen.findByText(/403: You do not have access/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin stats' })).not.toBeInTheDocument()
    expect(screen.queryByText('Total orders')).not.toBeInTheDocument()
  })

  it('shows admins the admin link and the stats', async () => {
    renderApp('/session/orders')
    await signInAs('admin')

    expect(await screen.findByRole('link', { name: 'Admin stats' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Admin stats' }))
    expect(await screen.findByText('Active sessions')).toBeInTheDocument()
  })

  it('restores the session after a reload without ever showing the login page', async () => {
    const first = renderApp('/session/orders')
    await signInAs('user')
    await screen.findByRole('heading', { name: 'Your orders' })
    first.unmount()

    resetApiClient()
    harness.fake.calls.length = 0
    renderApp('/session/orders')

    expect(screen.getByText('Restoring your session...')).toBeInTheDocument()
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Your orders' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()
    expect(harness.fake.calls.map((call) => call.path).slice(0, 2)).toEqual(['/api/auth/refresh', '/api/me'])
  })

  it('makes no refresh call on a cold visit when nobody is logged in', async () => {
    renderApp('/session/orders')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(harness.fake.calls).toHaveLength(0)
  })

  it('falls back to the login page when the refresh token expired while the tab was closed', async () => {
    const first = renderApp('/session/orders')
    await signInAs('user')
    await screen.findByRole('heading', { name: 'Your orders' })
    first.unmount()

    resetApiClient()
    harness.advance(601_000)
    renderApp('/session/orders')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
    expect(window.localStorage.length).toBe(0)
  })

  it('does not restore a session after logging out', async () => {
    const first = renderApp('/session/orders')
    await signInAs('user')
    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    first.unmount()

    resetApiClient()
    renderApp('/session/orders')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(harness.fake.cookieJar.size).toBe(0)
  })

  it('recovers silently when the access token expires and 3 requests fire at once', async () => {
    renderApp('/session/orders')
    await signInAs('user')
    await screen.findByRole('heading', { name: 'Your orders' })

    harness.advance(31_000)
    await userEvent.click(screen.getByRole('button', { name: 'Fire 3 requests at once' }))

    expect(await screen.findByText('Last run: ok, ok, ok')).toBeInTheDocument()
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('logs the user out and shows the login page when the refresh token has expired', async () => {
    renderApp('/session/orders')
    await signInAs('user')
    await screen.findByRole('heading', { name: 'Your orders' })

    harness.advance(601_000)
    await userEvent.click(screen.getByRole('button', { name: 'Fire 3 requests at once' }))

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Your session expired. Please sign in again.')).toBeInTheDocument()
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
  })
})
