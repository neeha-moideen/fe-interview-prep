import type { MockBackend } from './backend'

export interface RecordedCall {
  method: string
  path: string
  status: number
}

export function createFakeFetch(backend: MockBackend) {
  const cookieJar = new Map<string, string>()
  const calls: RecordedCall[] = []

  async function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = new URL(String(input), 'http://localhost')
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((value, name) => {
      headers[name.toLowerCase()] = value
    })

    const result = await backend.handle({
      method: (init?.method ?? 'GET').toUpperCase(),
      path: url.pathname,
      headers,
      cookies: Object.fromEntries(cookieJar),
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    })

    for (const cookie of result.setCookies ?? []) {
      if (cookie.maxAgeSeconds <= 0) cookieJar.delete(cookie.name)
      else cookieJar.set(cookie.name, cookie.value)
    }
    calls.push({ method: (init?.method ?? 'GET').toUpperCase(), path: url.pathname, status: result.status })

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'content-type': 'application/json' },
    })
  }

  return {
    fetch: fakeFetch,
    calls,
    cookieJar,
    count: (path: string) => calls.filter((call) => call.path === path).length,
  }
}
