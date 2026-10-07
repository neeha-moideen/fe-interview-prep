import type { z } from 'zod'
import { describe, expect, it } from 'vitest'
import {
  COUNTRIES,
  PLANS,
  addressSchema,
  emptyRegistration,
  firstInvalidStep,
  personalSchema,
  preferencesSchema,
} from './schemas'

function messageFor(schema: z.ZodType, input: unknown, field: string): string | undefined {
  const result = schema.safeParse(input)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

const validPersonal = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210' }
const validAddress = { country: 'India', city: 'Kochi', postalCode: '682001' }
const validPreferences = { plan: 'pro', skills: ['React'] }

describe('personalSchema: name', () => {
  it.each(['Asha Rao', 'Al', "Mary-Jane O'Neil", 'José Álvarez', '李雷', '  Asha Rao  '])(
    'accepts %j',
    (name) => {
      expect(messageFor(personalSchema, { ...validPersonal, name }, 'name')).toBeUndefined()
    },
  )

  it.each(['', '   ', 'A', '12', '--', '1', 'A'.repeat(101)])('rejects %j', (name) => {
    expect(messageFor(personalSchema, { ...validPersonal, name }, 'name')).toBeDefined()
  })

  it.each([
    ['', 'Enter your full name'],
    ['   ', 'Enter your full name'],
    ['A', 'Name must be at least 2 characters'],
    ['12', 'Name must contain letters'],
    ['A'.repeat(101), 'Name must be 100 characters or fewer'],
  ])('explains why %j is rejected', (name, message) => {
    expect(messageFor(personalSchema, { ...validPersonal, name }, 'name')).toBe(message)
  })
})

describe('personalSchema: email', () => {
  it.each(['asha@example.com', ' asha@example.com ', 'asha+tag@example.co.in', 'a@b.co'])(
    'accepts %j',
    (email) => {
      expect(messageFor(personalSchema, { ...validPersonal, email }, 'email')).toBeUndefined()
    },
  )

  it.each([
    '',
    'plain',
    'a@b',
    'a@b.c',
    'a b@c.com',
    'asha@@example.com',
    'asha@example..com',
    '@example.com',
    'asha@',
    `${'a'.repeat(250)}@x.com`,
  ])('rejects %j', (email) => {
    expect(messageFor(personalSchema, { ...validPersonal, email }, 'email')).toBeDefined()
  })

  it.each([
    ['', 'Enter your email address'],
    ['plain', 'Enter a valid email address'],
    [`${'a'.repeat(250)}@x.com`, 'Email must be 254 characters or fewer'],
  ])('explains why %j is rejected', (email, message) => {
    expect(messageFor(personalSchema, { ...validPersonal, email }, 'email')).toBe(message)
  })
})

describe('personalSchema: phone', () => {
  it.each([
    '9876543210',
    '+91 98765 43210',
    '98765-43210',
    '(555) 123-4567',
    '+1 (555) 123-4567',
    ' 9876543210 ',
    '1234567',
    '123456789012345',
  ])('accepts %j', (phone) => {
    expect(messageFor(personalSchema, { ...validPersonal, phone }, 'phone')).toBeUndefined()
  })

  it.each([
    '',
    'abc',
    '-------',
    '++++++++',
    '()()()()',
    '+',
    '12345',
    '123456',
    '1234567890123456',
    '+91+9876543210',
    '98765x43210',
  ])('rejects %j', (phone) => {
    expect(messageFor(personalSchema, { ...validPersonal, phone }, 'phone')).toBeDefined()
  })

  it.each([
    ['', 'Enter your phone number'],
    ['-------', 'Enter a valid phone number'],
    ['12345', 'Enter a valid phone number'],
  ])('explains why %j is rejected', (phone, message) => {
    expect(messageFor(personalSchema, { ...validPersonal, phone }, 'phone')).toBe(message)
  })
})

describe('personalSchema: parsed output', () => {
  it('trims every field', () => {
    expect(
      personalSchema.parse({ name: '  Asha Rao ', email: ' asha@example.com ', phone: ' 9876543210 ' }),
    ).toEqual({ name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' })
  })
})

describe('addressSchema: country and city', () => {
  it.each([...COUNTRIES])('accepts %s', (country) => {
    expect(messageFor(addressSchema, { ...validAddress, country, postalCode: '682001' }, 'country')).toBeUndefined()
  })

  it.each(['', 'Atlantis'])('rejects the country %j', (country) => {
    expect(messageFor(addressSchema, { ...validAddress, country }, 'country')).toBe('Select a country')
  })

  it.each(["Kochi", "St. John's", 'München', '東京'])('accepts the city %j', (city) => {
    expect(messageFor(addressSchema, { ...validAddress, city }, 'city')).toBeUndefined()
  })

  it.each(['', '  ', '1', '12', '--', 'K'.repeat(101)])('rejects the city %j', (city) => {
    expect(messageFor(addressSchema, { ...validAddress, city }, 'city')).toBeDefined()
  })

  it.each([
    ['', 'Enter your city'],
    ['K', 'City must be at least 2 characters'],
    ['12', 'City must contain letters'],
    ['K'.repeat(101), 'City must be 100 characters or fewer'],
  ])('explains why the city %j is rejected', (city, message) => {
    expect(messageFor(addressSchema, { ...validAddress, city }, 'city')).toBe(message)
  })
})

describe('addressSchema: postal code', () => {
  it.each(['682001', ' 682001 ', '000000'])('accepts %j for India', (postalCode) => {
    expect(messageFor(addressSchema, { ...validAddress, postalCode }, 'postalCode')).toBeUndefined()
  })

  it.each(['68200', '6820011', '68200a', '68 2001', '٦٨٢٠٠١', '682-001'])(
    'rejects %j for India',
    (postalCode) => {
      expect(messageFor(addressSchema, { ...validAddress, postalCode }, 'postalCode')).toBe(
        'Indian postal codes must be 6 digits',
      )
    },
  )

  it.each(['SW1A 1AA', 'K1A 0B1', '12345', '12345-6789', '###'])(
    'accepts %j for other countries',
    (postalCode) => {
      expect(
        messageFor(addressSchema, { ...validAddress, country: 'United Kingdom', postalCode }, 'postalCode'),
      ).toBeUndefined()
    },
  )

  it.each(['', '   '])('requires a postal code for every country: %j', (postalCode) => {
    const india = messageFor(addressSchema, { ...validAddress, postalCode }, 'postalCode')
    const other = messageFor(
      addressSchema,
      { ...validAddress, country: 'Canada', postalCode },
      'postalCode',
    )
    expect(india).toBe('Enter your postal code')
    expect(other).toBe('Enter your postal code')
  })

  it('caps the length for other countries', () => {
    expect(
      messageFor(
        addressSchema,
        { ...validAddress, country: 'Canada', postalCode: 'X'.repeat(21) },
        'postalCode',
      ),
    ).toBe('Postal code must be 20 characters or fewer')
  })

  it('applies the India rule even while another field is invalid', () => {
    const result = addressSchema.safeParse({ country: 'India', city: '', postalCode: '12' })
    expect(result.success).toBe(false)
    const paths = result.error?.issues.map((issue) => issue.path[0])
    expect(paths).toContain('city')
    expect(paths).toContain('postalCode')
  })

  it('does not apply the India rule when no country is chosen', () => {
    expect(messageFor(addressSchema, { country: '', city: 'Kochi', postalCode: '12' }, 'postalCode')).toBeUndefined()
  })

  it('reports the postal code error on the postalCode field', () => {
    const result = addressSchema.safeParse({ ...validAddress, postalCode: '12' })
    expect(result.error?.issues[0].path).toEqual(['postalCode'])
  })
})

describe('addressSchema: parsed output', () => {
  it('trims city and postal code', () => {
    expect(addressSchema.parse({ country: 'India', city: ' Kochi ', postalCode: ' 682001 ' })).toEqual(
      validAddress,
    )
  })
})

describe('preferencesSchema', () => {
  it.each(PLANS.map((plan) => plan.value))('accepts the plan %s', (plan) => {
    expect(messageFor(preferencesSchema, { ...validPreferences, plan }, 'plan')).toBeUndefined()
  })

  it.each(['', 'gold', 'PRO'])('rejects the plan %j', (plan) => {
    expect(messageFor(preferencesSchema, { ...validPreferences, plan }, 'plan')).toBe('Choose a plan')
  })

  it('requires at least one skill', () => {
    expect(messageFor(preferencesSchema, { ...validPreferences, skills: [] }, 'skills')).toBe(
      'Add at least one skill',
    )
    expect(preferencesSchema.safeParse({ ...validPreferences, skills: ['  '] }).success).toBe(false)
    expect(preferencesSchema.safeParse(validPreferences).success).toBe(true)
  })

  it('reports a missing plan and missing skills together', () => {
    const result = preferencesSchema.safeParse({ plan: '', skills: [] })
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(['plan', 'skills']),
    )
  })

  it('trims skills', () => {
    expect(preferencesSchema.parse({ plan: 'pro', skills: [' React '] }).skills).toEqual(['React'])
  })
})

describe('firstInvalidStep', () => {
  it('returns the first step whose data is invalid', () => {
    expect(firstInvalidStep(emptyRegistration)).toBe(0)
    expect(
      firstInvalidStep({
        personal: validPersonal,
        address: { ...validAddress, postalCode: '123' },
        preferences: validPreferences,
      }),
    ).toBe(1)
    expect(
      firstInvalidStep({
        personal: { ...validPersonal, phone: '-------' },
        address: validAddress,
        preferences: validPreferences,
      }),
    ).toBe(0)
  })

  it('returns null when every step is valid', () => {
    expect(
      firstInvalidStep({
        personal: validPersonal,
        address: validAddress,
        preferences: validPreferences,
      }),
    ).toBeNull()
  })
})
