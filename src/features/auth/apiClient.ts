import type { z } from 'zod'
import { ApiError, readMessage, refreshRequest } from './authApi'
import { sessionHint } from './sessionHint'
import { tokenStore } from './tokenStore'

export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired')
    this.name = 'SessionExpiredError'
  }
}

let refreshInFlight: Promise<string> | null = null
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

export function resetApiClient() {
  tokenStore.clear()
  refreshInFlight = null
  onSessionExpired = null
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = refreshRequest()
      .then(({ accessToken, expiresIn }) => {
        tokenStore.set(accessToken, expiresIn)
        return accessToken
      })
      .catch((error: unknown) => {
        tokenStore.clear()
        sessionHint.clear()
        onSessionExpired?.()
        throw error
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

function send(input: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers = new Headers(init.headers)
  if (token) headers.set('authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const tokenUsed = tokenStore.get()
  const response = await send(input, init, tokenUsed)
  if (response.status !== 401) return response

  const latest = tokenStore.get()
  let token: string
  if (latest !== null && latest !== tokenUsed) {
    token = latest
  } else {
    try {
      token = await refreshAccessToken()
    } catch {
      throw new SessionExpiredError()
    }
  }

  const retry = await send(input, init, token)
  if (retry.status === 401) {
    tokenStore.clear()
    sessionHint.clear()
    onSessionExpired?.()
    throw new SessionExpiredError()
  }
  return retry
}

export async function apiJson<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init)
  if (!response.ok) throw new ApiError(response.status, await readMessage(response, 'Request failed'))
  return schema.parse(await response.json())
}
