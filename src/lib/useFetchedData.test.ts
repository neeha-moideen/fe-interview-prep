import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFetchedData } from '@/lib/useFetchedData'

describe('useFetchedData', () => {
  it('goes from loading to success', async () => {
    const load = vi.fn().mockResolvedValue(['a'])
    const { result } = renderHook(() => useFetchedData(load))

    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => expect(result.current.state).toEqual({ status: 'success', data: ['a'] }))
  })

  it('reports an error and recovers on retry', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useFetchedData(load))

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', message: 'boom' }))
    act(() => result.current.retry())
    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => expect(result.current.state).toEqual({ status: 'success', data: 'ok' }))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('aborts the request on unmount', () => {
    let captured: AbortSignal | undefined
    const load = vi.fn((signal: AbortSignal) => {
      captured = signal
      return new Promise<string>(() => {})
    })
    const { unmount } = renderHook(() => useFetchedData(load))

    unmount()
    expect(captured?.aborted).toBe(true)
  })
})
