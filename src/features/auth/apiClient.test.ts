import { z } from 'zod'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestBackend } from '@/mock/testHarness'
import {
  SessionExpiredError,
  apiFetch,
  apiJson,
  refreshAccessToken,
  resetApiClient,
  setSessionExpiredHandler,
} from './apiClient'
import { loginRequest } from './authApi'
import { userSchema } from './schemas'
import { tokenStore } from './tokenStore'

const ordersSchema = z.array(z.object({ id: z.number() }))

let harness: ReturnType<typeof createTestBackend>
const onSessionExpired = vi.fn()

async function signIn(username = 'user') {
  const result = await loginRequest(username, `${username}123`)
  tokenStore.set(result.accessToken, result.expiresIn)
}

function threeRequests() {
  return Promise.all([
    apiJson('/api/me', userSchema),
    apiJson('/api/orders', ordersSchema),
    apiJson('/api/orders', ordersSchema),
  ])
}

describe('apiClient', () => {
  beforeEach(() => {
    harness = createTestBackend()
    vi.stubGlobal('fetch', harness.fake.fetch)
    resetApiClient()
    onSessionExpired.mockReset()
    setSessionExpiredHandler(onSessionExpired)
  })
  afterEach(() => {
    resetApiClient()
    vi.unstubAllGlobals()
  })

  it('makes exactly one refresh call when 3 requests fail at once after the access token expires', async () => {
    await signIn()
    harness.advance(31_000)

    const [me, orders] = await threeRequests()

    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
    expect(me.username).toBe('user')
    expect(orders).toHaveLength(4)

    const dataCalls = harness.fake.calls.filter((call) => call.path === '/api/me' || call.path === '/api/orders')
    expect(dataCalls.filter((call) => call.status === 401)).toHaveLength(3)
    expect(dataCalls.filter((call) => call.status === 200)).toHaveLength(3)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('does not refresh while the access token is still valid', async () => {
    await signIn()
    harness.advance(10_000)

    await threeRequests()

    expect(harness.fake.count('/api/auth/refresh')).toBe(0)
  })

  it('refreshes again for a later expiry, once per wave', async () => {
    await signIn()
    harness.advance(31_000)
    await threeRequests()
    harness.advance(31_000)
    await threeRequests()

    expect(harness.fake.count('/api/auth/refresh')).toBe(2)
  })

  it('does not refresh again when a stale 401 arrives after another request already refreshed', async () => {
    await signIn()
    harness.advance(31_000)

    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let held = false
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await harness.fake.fetch(input, init)
      if (!held && String(input) === '/api/orders') {
        held = true
        await gate
      }
      return response
    })

    const slow = apiJson('/api/orders', ordersSchema)
    const fast = apiJson('/api/me', userSchema)
    await fast
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)

    release()
    await expect(slow).resolves.toHaveLength(4)
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
  })

  it('logs the user out once, and every request fails, when the refresh token has expired', async () => {
    await signIn()
    harness.advance(601_000)

    const results = await Promise.allSettled([
      apiFetch('/api/me'),
      apiFetch('/api/orders'),
      apiFetch('/api/orders'),
    ])

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    for (const result of results) {
      expect(result.status === 'rejected' && result.reason).toBeInstanceOf(SessionExpiredError)
    }
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(tokenStore.get()).toBeNull()
  })

  it('retries a request only once and then gives up', async () => {
    await signIn()
    let attempts = 0
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === '/api/orders') {
        attempts += 1
        return new Response('{}', { status: 401 })
      }
      return harness.fake.fetch(input, init)
    })

    await expect(apiFetch('/api/orders')).rejects.toBeInstanceOf(SessionExpiredError)
    expect(attempts).toBe(2)
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('does not treat a 403 as an expired token', async () => {
    await signIn('user')

    const response = await apiFetch('/api/admin/stats')

    expect(response.status).toBe(403)
    expect(harness.fake.count('/api/auth/refresh')).toBe(0)
  })

  it('shares one refresh call between callers that ask at the same time', async () => {
    await signIn()
    harness.advance(31_000)

    const [first, second] = await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(first).toBe(second)
    expect(harness.fake.count('/api/auth/refresh')).toBe(1)
  })

  it('refreshes from the cookie alone when there is no access token in memory', async () => {
    await signIn()
    tokenStore.clear()

    const token = await refreshAccessToken()

    expect(token).toBeTruthy()
    expect(tokenStore.get()).toBe(token)
  })
})
