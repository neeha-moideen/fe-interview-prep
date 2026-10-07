import { z } from 'zod'

export const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Australia',
] as const

export const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
] as const

const INDIA_POSTAL_CODE = /^\d{6}$/
const PHONE = /^\+?[0-9\s-]{7,15}$/

export const personalSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  phone: z.string().trim().regex(PHONE, 'Enter a valid phone number'),
})

export const addressSchema = z
  .object({
    country: z
      .string()
      .refine((value) => (COUNTRIES as readonly string[]).includes(value), 'Select a country'),
    city: z.string().trim().min(2, 'Enter your city'),
    postalCode: z.string().trim().min(1, 'Enter your postal code'),
  })
  .superRefine((value, context) => {
    if (value.country === 'India' && !INDIA_POSTAL_CODE.test(value.postalCode.trim())) {
      context.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: 'Indian postal codes must be 6 digits',
      })
    }
  })

export const preferencesSchema = z.object({
  plan: z
    .string()
    .refine((value) => PLANS.some((plan) => plan.value === value), 'Choose a plan'),
  skills: z.array(z.string().trim().min(1)).min(1, 'Add at least one skill'),
})

export type PersonalInfo = z.infer<typeof personalSchema>
export type Address = z.infer<typeof addressSchema>
export type Preferences = z.infer<typeof preferencesSchema>

export interface RegistrationData {
  personal: PersonalInfo
  address: Address
  preferences: Preferences
}

export const emptyRegistration: RegistrationData = {
  personal: { name: '', email: '', phone: '' },
  address: { country: '', city: '', postalCode: '' },
  preferences: { plan: '', skills: [] },
}

export function firstInvalidStep(data: RegistrationData): number | null {
  if (!personalSchema.safeParse(data.personal).success) return 0
  if (!addressSchema.safeParse(data.address).success) return 1
  if (!preferencesSchema.safeParse(data.preferences).success) return 2
  return null
}
