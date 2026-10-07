import { z } from 'zod'
import {
  emptyRegistration,
  firstInvalidStep,
  type Address,
  type PersonalInfo,
  type Preferences,
  type RegistrationData,
} from './schemas'

export const STEP_LABELS = ['Personal info', 'Address', 'Preferences'] as const
export const REVIEW_STEP = STEP_LABELS.length

export interface WizardState {
  step: number
  data: RegistrationData
  returnToReview: boolean
  submitted: boolean
}

export type WizardAction =
  | { type: 'draft'; section: 'personal'; values: PersonalInfo }
  | { type: 'draft'; section: 'address'; values: Address }
  | { type: 'draft'; section: 'preferences'; values: Preferences }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'edit'; step: number }
  | { type: 'goTo'; step: number }
  | { type: 'submitted' }
  | { type: 'reset' }

export const initialWizardState: WizardState = {
  step: 0,
  data: emptyRegistration,
  returnToReview: false,
  submitted: false,
}

const stateSchema = z.object({
  step: z.number().int().min(0).max(REVIEW_STEP),
  returnToReview: z.boolean(),
  submitted: z.boolean(),
  data: z.object({
    personal: z.object({ name: z.string(), email: z.string(), phone: z.string() }),
    address: z.object({ country: z.string(), city: z.string(), postalCode: z.string() }),
    preferences: z.object({ plan: z.string(), skills: z.array(z.string()) }),
  }),
})

export function isWizardState(value: unknown): value is WizardState {
  return stateSchema.safeParse(value).success
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'draft':
      return { ...state, data: { ...state.data, [action.section]: action.values } }
    case 'next': {
      const target = state.returnToReview ? REVIEW_STEP : state.step + 1
      const furthestAllowed = firstInvalidStep(state.data) ?? REVIEW_STEP
      const step = Math.min(target, furthestAllowed)
      return { ...state, step, returnToReview: step === REVIEW_STEP ? false : state.returnToReview }
    }
    case 'back':
      return { ...state, step: Math.max(state.step - 1, 0) }
    case 'edit':
      return { ...state, step: action.step, returnToReview: true }
    case 'goTo':
      return { ...state, step: action.step, returnToReview: false }
    case 'submitted':
      return { ...state, submitted: true }
    case 'reset':
      return initialWizardState
  }
}
