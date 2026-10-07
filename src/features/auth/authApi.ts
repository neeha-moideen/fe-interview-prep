import { loginResponseSchema, tokenResponseSchema } from './schemas'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function readMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown }
    return typeof data.message === 'string' ? data.message : fallback
  } catch {
    return fallback
  }
}

export async function loginRequest(username: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) throw new ApiError(response.status, await readMessage(response, 'Login failed'))
  return loginResponseSchema.parse(await response.json())
}

export async function refreshRequest() {
  const response = await fetch('/api/auth/refresh', { method: 'POST' })
  if (!response.ok) throw new ApiError(response.status, await readMessage(response, 'Session expired'))
  return tokenResponseSchema.parse(await response.json())
}

export async function logoutRequest(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}
