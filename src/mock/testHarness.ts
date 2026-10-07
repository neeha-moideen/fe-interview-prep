import { createMockBackend, type MockBackendOptions } from './backend'
import { createFakeFetch } from './fakeFetch'

export function createTestBackend(options: MockBackendOptions = {}) {
  const clock = { now: 1_700_000_000_000 }
  const backend = createMockBackend({ now: () => clock.now, ...options })
  const fake = createFakeFetch(backend)

  return {
    backend,
    fake,
    advance(milliseconds: number) {
      clock.now += milliseconds
    },
  }
}
