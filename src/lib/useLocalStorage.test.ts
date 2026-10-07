import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage } from '@/lib/useLocalStorage'

const isNumber = (value: unknown): value is number => typeof value === 'number'

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear())

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1))
    expect(result.current[0]).toBe(1)
  })

  it('persists updates and restores them in a new hook instance', () => {
    const first = renderHook(() => useLocalStorage('count', 1))
    act(() => first.result.current[1](5))
    first.unmount()

    const second = renderHook(() => useLocalStorage('count', 1))
    expect(second.result.current[0]).toBe(5)
  })

  it('falls back when the stored value is not valid JSON', () => {
    window.localStorage.setItem('count', '{broken')
    const { result } = renderHook(() => useLocalStorage('count', 1))
    expect(result.current[0]).toBe(1)
  })

  it('falls back when the stored value fails the guard', () => {
    window.localStorage.setItem('count', JSON.stringify('nope'))
    const { result } = renderHook(() => useLocalStorage('count', 1, isNumber))
    expect(result.current[0]).toBe(1)
  })
})
