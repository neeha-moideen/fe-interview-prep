export type Role = 'user' | 'admin'

export interface PublicUser {
  id: number
  username: string
  name: string
  role: Role
}

export interface MockOrder {
  id: number
  userId: number
  item: string
  total: number
  status: 'processing' | 'shipped' | 'delivered'
  placedAt: string
}

export interface CookieInstruction {
  name: string
  value: string
  maxAgeSeconds: number
  path: string
}

export interface MockRequest {
  method: string
  path: string
  headers: Record<string, string>
  cookies: Record<string, string>
  body?: unknown
}

export interface MockResponse {
  status: number
  body: unknown
  setCookies?: CookieInstruction[]
}

export interface MockBackendOptions {
  now?: () => number
  delayMs?: number
  accessTtlMs?: number
  refreshTtlMs?: number
}

export const ACCESS_TOKEN_TTL_MS = 30_000
export const REFRESH_TOKEN_TTL_MS = 600_000
export const REFRESH_COOKIE = 'refresh_token'
export const REFRESH_COOKIE_PATH = '/api/auth'

interface StoredUser extends PublicUser {
  password: string
}

interface Session {
  userId: number
  expiresAt: number
}

const USERS: StoredUser[] = [
  { id: 1, username: 'user', password: 'user123', name: 'Asha Rao', role: 'user' },
  { id: 2, username: 'admin', password: 'admin123', name: 'Ravi Menon', role: 'admin' },
]

const ORDERS: MockOrder[] = [
  { id: 1001, userId: 1, item: 'Mechanical keyboard', total: 8999, status: 'delivered', placedAt: '2026-09-02' },
  { id: 1002, userId: 1, item: 'USB-C dock', total: 5499, status: 'delivered', placedAt: '2026-09-14' },
  { id: 1003, userId: 1, item: 'Noise-cancelling headphones', total: 17999, status: 'shipped', placedAt: '2026-10-01' },
  { id: 1004, userId: 1, item: 'Laptop stand', total: 2499, status: 'processing', placedAt: '2026-10-05' },
  { id: 2001, userId: 2, item: 'Standing desk', total: 32999, status: 'delivered', placedAt: '2026-08-21' },
  { id: 2002, userId: 2, item: 'Monitor arm', total: 6499, status: 'shipped', placedAt: '2026-09-30' },
  { id: 2003, userId: 2, item: 'Webcam', total: 4999, status: 'processing', placedAt: '2026-10-06' },
]

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, username: user.username, name: user.name, role: user.role }
}

function readCredentials(body: unknown): { username: string; password: string } | null {
  if (typeof body !== 'object' || body === null) return null
  const { username, password } = body as Record<string, unknown>
  if (typeof username !== 'string' || typeof password !== 'string') return null
  return { username, password }
}

function respond(status: number, body: unknown, setCookies?: CookieInstruction[]): MockResponse {
  return { status, body, setCookies }
}

function clearRefreshCookie(): CookieInstruction {
  return { name: REFRESH_COOKIE, value: '', maxAgeSeconds: 0, path: REFRESH_COOKIE_PATH }
}

export function createMockBackend(options: MockBackendOptions = {}) {
  const now = options.now ?? Date.now
  const delayMs = options.delayMs ?? 0
  const accessTtlMs = options.accessTtlMs ?? ACCESS_TOKEN_TTL_MS
  const refreshTtlMs = options.refreshTtlMs ?? REFRESH_TOKEN_TTL_MS
  const accessTokens = new Map<string, Session>()
  const refreshTokens = new Map<string, Session>()

  function issueAccessToken(userId: number): string {
    const token = crypto.randomUUID()
    accessTokens.set(token, { userId, expiresAt: now() + accessTtlMs })
    return token
  }

  function authenticate(request: MockRequest): { user: StoredUser } | { error: MockResponse } {
    const header = request.headers['authorization'] ?? ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
    const session = accessTokens.get(token)
    if (!session) {
      return { error: respond(401, { message: 'Missing or invalid access token', code: 'unauthenticated' }) }
    }
    if (session.expiresAt <= now()) {
      return { error: respond(401, { message: 'Access token expired', code: 'token_expired' }) }
    }
    const user = USERS.find((candidate) => candidate.id === session.userId)
    if (!user) return { error: respond(401, { message: 'Unknown user', code: 'unauthenticated' }) }
    return { user }
  }

  function login(request: MockRequest): MockResponse {
    const credentials = readCredentials(request.body)
    const user = credentials
      ? USERS.find(
          (candidate) =>
            candidate.username === credentials.username && candidate.password === credentials.password,
        )
      : undefined
    if (!user) return respond(401, { message: 'Invalid username or password' })

    const refreshToken = crypto.randomUUID()
    refreshTokens.set(refreshToken, { userId: user.id, expiresAt: now() + refreshTtlMs })
    return respond(
      200,
      { accessToken: issueAccessToken(user.id), expiresIn: accessTtlMs / 1000, user: toPublicUser(user) },
      [{ name: REFRESH_COOKIE, value: refreshToken, maxAgeSeconds: refreshTtlMs / 1000, path: REFRESH_COOKIE_PATH }],
    )
  }

  function refresh(request: MockRequest): MockResponse {
    const token = request.cookies[REFRESH_COOKIE]
    const session = token ? refreshTokens.get(token) : undefined
    if (!token || !session || session.expiresAt <= now()) {
      if (token) refreshTokens.delete(token)
      return respond(401, { message: 'Refresh token expired or invalid', code: 'refresh_expired' }, [
        clearRefreshCookie(),
      ])
    }
    return respond(200, { accessToken: issueAccessToken(session.userId), expiresIn: accessTtlMs / 1000 })
  }

  function logout(request: MockRequest): MockResponse {
    const token = request.cookies[REFRESH_COOKIE]
    if (token) refreshTokens.delete(token)
    return respond(200, { ok: true }, [clearRefreshCookie()])
  }

  function orders(request: MockRequest): MockResponse {
    const result = authenticate(request)
    if ('error' in result) return result.error
    const visible = result.user.role === 'admin' ? ORDERS : ORDERS.filter((order) => order.userId === result.user.id)
    return respond(200, visible)
  }

  function adminStats(request: MockRequest): MockResponse {
    const result = authenticate(request)
    if ('error' in result) return result.error
    if (result.user.role !== 'admin') return respond(403, { message: 'Admins only', code: 'forbidden' })
    const activeSessions = Array.from(refreshTokens.values()).filter((session) => session.expiresAt > now()).length
    return respond(200, {
      totalOrders: ORDERS.length,
      revenue: ORDERS.reduce((sum, order) => sum + order.total, 0),
      users: USERS.length,
      activeSessions,
    })
  }

  function expireAccessTokens(): MockResponse {
    let expired = 0
    for (const session of accessTokens.values()) {
      if (session.expiresAt > now()) {
        session.expiresAt = now()
        expired += 1
      }
    }
    return respond(200, { expired })
  }

  async function handle(request: MockRequest): Promise<MockResponse> {
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs))

    switch (`${request.method} ${request.path}`) {
      case 'POST /api/auth/login':
        return login(request)
      case 'POST /api/auth/refresh':
        return refresh(request)
      case 'POST /api/auth/logout':
        return logout(request)
      case 'GET /api/me': {
        const result = authenticate(request)
        return 'error' in result ? result.error : respond(200, toPublicUser(result.user))
      }
      case 'GET /api/orders':
        return orders(request)
      case 'GET /api/admin/stats':
        return adminStats(request)
      case 'POST /api/debug/expire-access-token':
        return expireAccessTokens()
      default:
        return respond(404, { message: 'Not found' })
    }
  }

  return { handle }
}

export type MockBackend = ReturnType<typeof createMockBackend>
