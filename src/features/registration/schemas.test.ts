import { describe, expect, it } from 'vitest'
import {
  addressSchema,
  emptyRegistration,
  firstInvalidStep,
  personalSchema,
  preferencesSchema,
} from './schemas'

describe('personalSchema', () => {
  const valid = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210' }

  it('accepts valid personal info', () => {
    expect(personalSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a short name, a bad email and a bad phone', () => {
    expect(personalSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
    expect(personalSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
    expect(personalSchema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false)
  })
})

describe('addressSchema', () => {
  it('requires a 6 digit postal code for India', () => {
    const base = { country: 'India', city: 'Kochi' }
    expect(addressSchema.safeParse({ ...base, postalCode: '682001' }).success).toBe(true)
    expect(addressSchema.safeParse({ ...base, postalCode: '6820' }).success).toBe(false)
    expect(addressSchema.safeParse({ ...base, postalCode: '68200A' }).success).toBe(false)
  })

  it('accepts any non-empty postal code for other countries', () => {
    const base = { country: 'United Kingdom', city: 'London' }
    expect(addressSchema.safeParse({ ...base, postalCode: 'SW1A 1AA' }).success).toBe(true)
    expect(addressSchema.safeParse({ ...base, postalCode: '' }).success).toBe(false)
  })

  it('reports the postal code error on the postalCode field', () => {
    const result = addressSchema.safeParse({ country: 'India', city: 'Kochi', postalCode: '12' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['postalCode'])
  })

  it('rejects an unknown country', () => {
    expect(addressSchema.safeParse({ country: '', city: 'Kochi', postalCode: '1' }).success).toBe(
      false,
    )
  })
})

describe('preferencesSchema', () => {
  it('requires a plan and at least one skill', () => {
    expect(preferencesSchema.safeParse({ plan: 'pro', skills: ['React'] }).success).toBe(true)
    expect(preferencesSchema.safeParse({ plan: 'pro', skills: [] }).success).toBe(false)
    expect(preferencesSchema.safeParse({ plan: '', skills: ['React'] }).success).toBe(false)
  })
})

describe('firstInvalidStep', () => {
  it('returns the first step whose data is invalid', () => {
    expect(firstInvalidStep(emptyRegistration)).toBe(0)
    expect(
      firstInvalidStep({
        personal: { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' },
        address: { country: 'India', city: 'Kochi', postalCode: '123' },
        preferences: { plan: 'pro', skills: ['React'] },
      }),
    ).toBe(1)
  })

  it('returns null when every step is valid', () => {
    expect(
      firstInvalidStep({
        personal: { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' },
        address: { country: 'India', city: 'Kochi', postalCode: '682001' },
        preferences: { plan: 'pro', skills: ['React'] },
      }),
    ).toBeNull()
  })
})
