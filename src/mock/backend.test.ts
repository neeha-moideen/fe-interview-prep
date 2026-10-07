import { describe, expect, it } from 'vitest'
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_MS,
  createMockBackend,
  type MockRequest,
} from './backend'

function setup() {
  const clock = { now: 1_700_000_000_000 }
  const backend = createMockBackend({ now: () => clock.now })

  function call(
    method: string,
    path: string,
    init: { token?: string; refreshCookie?: string; body?: unknown } = {},
  ) {
    const request: MockRequest = {
      method,
      path,
      headers: init.token ? { authorization: `Bearer ${init.token}` } : {},
      cookies: init.refreshCookie ? { [REFRESH_COOKIE]: init.refreshCookie } : {},
      body: init.body,
    }
    return backend.handle(request)
  }

  async function signIn(username = 'user') {
    const response = await call('POST', '/api/auth/login', {
      body: { username, password: `${username}123` },
    })
    const body = response.body as { accessToken: string }
    return { accessToken: body.accessToken, refreshCookie: response.setCookies?.[0].value ?? '' }
  }

  return { clock, call, signIn }
}

describe('mock backend: login', () => {
  it('returns an access token, the user and a refresh cookie', async () => {
    const { call } = setup()
    const response = await call('POST', '/api/auth/login', { body: { username: 'user', password: 'user123' } })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ expiresIn: 30, user: { username: 'user', role: 'user' } })
    expect(response.setCookies?.[0]).toMatchObject({
      name: REFRESH_COOKIE,
      maxAgeSeconds: REFRESH_TOKEN_TTL_MS / 1000,
      path: '/api/auth',
    })
  })

  it('never puts the refresh token in the response body', async () => {
    const { call, signIn } = setup()
    const { refreshCookie } = await signIn()
    const response = await call('POST', '/api/auth/login', { body: { username: 'user', password: 'user123' } })
    expect(JSON.stringify(response.body)).not.toContain(refreshCookie)
  })

  it.each([
    [{ username: 'user', password: 'wrong' }],
    [{ username: 'nobody', password: 'user123' }],
    [{ username: 'user' }],
    [undefined],
  ])('rejects the credentials %j', async (body) => {
    const { call } = setup()
    const response = await call('POST', '/api/auth/login', { body })
    expect(response.status).toBe(401)
    expect(response.setCookies).toBeUndefined()
  })
})

describe('mock backend: access token lifetime', () => {
  it('accepts the token for 30 seconds and rejects it from then on', async () => {
    const { call, clock, signIn } = setup()
    const { accessToken } = await signIn()

    clock.now += ACCESS_TOKEN_TTL_MS - 1
    expect((await call('GET', '/api/me', { token: accessToken })).status).toBe(200)

    clock.now += 1
    const expired = await call('GET', '/api/me', { token: accessToken })
    expect(expired.status).toBe(401)
    expect(expired.body).toMatchObject({ code: 'token_expired' })
  })

  it('rejects a missing or unknown token', async () => {
    const { call } = setup()
    expect((await call('GET', '/api/me')).status).toBe(401)
    expect((await call('GET', '/api/me', { token: 'made-up' })).status).toBe(401)
  })
})

describe('mock backend: refresh', () => {
  it('issues a new access token while the refresh cookie is valid', async () => {
    const { call, clock, signIn } = setup()
    const { refreshCookie } = await signIn()

    clock.now += 45_000
    const response = await call('POST', '/api/auth/refresh', { refreshCookie })
    const { accessToken } = response.body as { accessToken: string }

    expect(response.status).toBe(200)
    expect((await call('GET', '/api/me', { token: accessToken })).status).toBe(200)
  })

  it('does not extend the refresh token: it still dies 10 minutes after login', async () => {
    const { call, clock, signIn } = setup()
    const { refreshCookie } = await signIn()

    clock.now += REFRESH_TOKEN_TTL_MS - 1000
    expect((await call('POST', '/api/auth/refresh', { refreshCookie })).status).toBe(200)

    clock.now += 1000
    const expired = await call('POST', '/api/auth/refresh', { refreshCookie })
    expect(expired.status).toBe(401)
    expect(expired.body).toMatchObject({ code: 'refresh_expired' })
    expect(expired.setCookies?.[0]).toMatchObject({ name: REFRESH_COOKIE, maxAgeSeconds: 0 })
  })

  it('rejects a missing or unknown refresh cookie', async () => {
    const { call } = setup()
    expect((await call('POST', '/api/auth/refresh')).status).toBe(401)
    expect((await call('POST', '/api/auth/refresh', { refreshCookie: 'made-up' })).status).toBe(401)
  })
})

describe('mock backend: logout', () => {
  it('revokes the refresh token and clears the cookie', async () => {
    const { call, signIn } = setup()
    const { refreshCookie } = await signIn()

    const logout = await call('POST', '/api/auth/logout', { refreshCookie })
    expect(logout.status).toBe(200)
    expect(logout.setCookies?.[0]).toMatchObject({ maxAgeSeconds: 0 })
    expect((await call('POST', '/api/auth/refresh', { refreshCookie })).status).toBe(401)
  })
})

describe('mock backend: data endpoints', () => {
  it('shows a user only their own orders and an admin every order', async () => {
    const { call, signIn } = setup()
    const user = await signIn('user')
    const admin = await signIn('admin')

    const userOrders = (await call('GET', '/api/orders', { token: user.accessToken })).body as unknown[]
    const adminOrders = (await call('GET', '/api/orders', { token: admin.accessToken })).body as unknown[]
    expect(userOrders).toHaveLength(4)
    expect(adminOrders).toHaveLength(7)
  })

  it('keeps the admin stats for admins: 403 for a user, 401 without a token', async () => {
    const { call, signIn } = setup()
    const user = await signIn('user')
    const admin = await signIn('admin')

    expect((await call('GET', '/api/admin/stats', { token: user.accessToken })).status).toBe(403)
    expect((await call('GET', '/api/admin/stats')).status).toBe(401)
    const stats = await call('GET', '/api/admin/stats', { token: admin.accessToken })
    expect(stats.status).toBe(200)
    expect(stats.body).toMatchObject({ totalOrders: 7, users: 2 })
  })

  it('can expire every access token on demand for demos', async () => {
    const { call, signIn } = setup()
    const { accessToken } = await signIn()

    const result = await call('POST', '/api/debug/expire-access-token')
    expect(result.body).toEqual({ expired: 1 })
    expect((await call('GET', '/api/me', { token: accessToken })).status).toBe(401)
  })

  it('answers 404 for an unknown route', async () => {
    const { call } = setup()
    expect((await call('GET', '/api/nothing')).status).toBe(404)
  })
})
