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
const PHONE_CHARACTERS = /^\+?[\d\s()-]+$/
const HAS_LETTER = /\p{L}/u
const MIN_PHONE_DIGITS = 7
const MAX_PHONE_DIGITS = 15
const MAX_EMAIL_LENGTH = 254
const MAX_TEXT_LENGTH = 100
const MAX_POSTAL_CODE_LENGTH = 20

function isCountry(value: string): boolean {
  return (COUNTRIES as readonly string[]).includes(value)
}

function isValidPhone(value: string): boolean {
  if (!PHONE_CHARACTERS.test(value)) return false
  const digits = value.replace(/\D/g, '').length
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS
}

function textField(label: string, requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .min(2, `${label} must be at least 2 characters`)
    .max(MAX_TEXT_LENGTH, `${label} must be ${MAX_TEXT_LENGTH} characters or fewer`)
    .refine((value) => HAS_LETTER.test(value), `${label} must contain letters`)
}

export const personalSchema = z.object({
  name: textField('Name', 'Enter your full name'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address')
    .max(MAX_EMAIL_LENGTH, `Email must be ${MAX_EMAIL_LENGTH} characters or fewer`)
    .pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number')
    .refine(isValidPhone, 'Enter a valid phone number'),
})

export const addressSchema = z
  .object({
    country: z.string().refine(isCountry, 'Select a country'),
    city: textField('City', 'Enter your city'),
    postalCode: z
      .string()
      .trim()
      .min(1, 'Enter your postal code')
      .max(
        MAX_POSTAL_CODE_LENGTH,
        `Postal code must be ${MAX_POSTAL_CODE_LENGTH} characters or fewer`,
      ),
  })
  .superRefine((value, context) => {
    if (value.country === 'India' && !INDIA_POSTAL_CODE.test(value.postalCode)) {
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
