import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { createMockBackend, type CookieInstruction } from './backend.ts'

const API_DELAY_MS = 250

function readBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      raw += chunk
    })
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : undefined)
      } catch {
        resolve(undefined)
      }
    })
  })
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    cookies[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim())
  }
  return cookies
}

function serializeCookie(cookie: CookieInstruction): string {
  return `${cookie.name}=${encodeURIComponent(cookie.value)}; Path=${cookie.path}; HttpOnly; SameSite=Strict; Max-Age=${cookie.maxAgeSeconds}`
}

export function mockApiPlugin(): Plugin {
  const backend = createMockBackend({ delayMs: API_DELAY_MS })

  async function respond(request: IncomingMessage, response: ServerResponse, path: string) {
    const headers: Record<string, string> = {}
    for (const [name, value] of Object.entries(request.headers)) {
      headers[name] = Array.isArray(value) ? value.join(', ') : (value ?? '')
    }

    const result = await backend.handle({
      method: (request.method ?? 'GET').toUpperCase(),
      path,
      headers,
      cookies: parseCookies(headers['cookie']),
      body: await readBody(request),
    })

    response.statusCode = result.status
    response.setHeader('content-type', 'application/json')
    if (result.setCookies?.length) response.setHeader('set-cookie', result.setCookies.map(serializeCookie))
    response.end(JSON.stringify(result.body))
  }

  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    if (!path.startsWith('/api/')) {
      next()
      return
    }
    void respond(request, response, path)
  }

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
