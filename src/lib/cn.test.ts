import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/cn'

describe('cn', () => {
  it('joins classes and skips falsy values', () => {
    const hidden = false as boolean
    expect(cn('a', hidden && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('accepts arrays and objects', () => {
    expect(cn(['a', { b: true, c: false }])).toBe('a b')
  })

  it('lets a later Tailwind class override a conflicting earlier one', () => {
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8')
  })
})
