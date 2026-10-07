import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { okUsersResponse } from './fixtures'
import { USER_COUNT, fetchUsers, usersUrl } from './usersApi'

const fetchMock = vi.fn()
const signal = new AbortController().signal

describe('usersApi', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('asks for a fixed seed and at least 500 users', () => {
    expect(USER_COUNT).toBeGreaterThanOrEqual(500)
    const url = new URL(usersUrl())
    expect(url.searchParams.get('results')).toBe(String(USER_COUNT))
    expect(url.searchParams.get('seed')).toBeTruthy()
  })

  it('maps the response to table rows', async () => {
    fetchMock.mockResolvedValue(okUsersResponse(3))
    const users = await fetchUsers(signal)

    expect(users).toHaveLength(3)
    expect(users[0]).toEqual({
      id: 'uuid-0',
      name: 'First0 Last0',
      email: 'user0@example.com',
      gender: 'Female',
      country: 'United States',
      city: 'City0',
      age: 20,
    })
    expect(users[1].gender).toBe('Male')
  })

  it('throws with the status for a failed request', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response)
    await expect(fetchUsers(signal)).rejects.toThrow('status 503')
  })

  it('throws a friendly error for an unexpected body', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ error: 'nope' }) } as Response)
    await expect(fetchUsers(signal)).rejects.toThrow('unexpected data')
  })
})
