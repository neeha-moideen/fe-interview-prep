import { describe, expect, it } from 'vitest'
import type { RegistrationData } from './schemas'
import {
  REVIEW_STEP,
  initialWizardState,
  isWizardState,
  wizardReducer,
  type WizardState,
} from './wizardReducer'

const validData: RegistrationData = {
  personal: { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' },
  address: { country: 'India', city: 'Kochi', postalCode: '682001' },
  preferences: { plan: 'pro', skills: ['React'] },
}

function stateAt(step: number, overrides: Partial<WizardState> = {}): WizardState {
  return { ...initialWizardState, data: validData, step, ...overrides }
}

describe('wizardReducer: moving forward and back', () => {
  it('does not advance while the current step is invalid', () => {
    expect(wizardReducer(initialWizardState, { type: 'next' }).step).toBe(0)

    const invalidAddress = stateAt(1, {
      data: { ...validData, address: { ...validData.address, postalCode: '123' } },
    })
    expect(wizardReducer(invalidAddress, { type: 'next' }).step).toBe(1)
  })

  it('advances one step at a time and stops at the review step', () => {
    let state = stateAt(0)
    state = wizardReducer(state, { type: 'next' })
    expect(state.step).toBe(1)
    state = wizardReducer(state, { type: 'next' })
    expect(state.step).toBe(2)
    state = wizardReducer(state, { type: 'next' })
    expect(state.step).toBe(REVIEW_STEP)
    state = wizardReducer(state, { type: 'next' })
    expect(state.step).toBe(REVIEW_STEP)
  })

  it('moves back within bounds', () => {
    expect(wizardReducer(initialWizardState, { type: 'back' }).step).toBe(0)
    expect(wizardReducer(stateAt(REVIEW_STEP), { type: 'back' }).step).toBe(REVIEW_STEP - 1)
  })

  it('keeps entered values when going back, even invalid ones', () => {
    let state = stateAt(1)
    state = wizardReducer(state, {
      type: 'draft',
      section: 'address',
      values: { ...validData.address, city: '' },
    })
    state = wizardReducer(state, { type: 'back' })
    expect(state.step).toBe(0)
    expect(state.data.address.city).toBe('')
    expect(state.data.personal).toEqual(validData.personal)
  })
})

describe('wizardReducer: editing from the review step', () => {
  it('returns to the review step after editing a section', () => {
    let state = wizardReducer(stateAt(REVIEW_STEP), { type: 'edit', step: 1 })
    expect(state).toMatchObject({ step: 1, returnToReview: true })

    state = wizardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ step: REVIEW_STEP, returnToReview: false })
  })

  it('does not skip a step that became invalid while editing', () => {
    let state = wizardReducer(stateAt(REVIEW_STEP), { type: 'edit', step: 1 })
    state = wizardReducer(state, {
      type: 'draft',
      section: 'address',
      values: { ...validData.address, city: '' },
    })
    state = wizardReducer(state, { type: 'back' })
    state = wizardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ step: 1, returnToReview: true })

    state = wizardReducer(state, { type: 'draft', section: 'address', values: validData.address })
    state = wizardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ step: REVIEW_STEP, returnToReview: false })
  })
})

describe('wizardReducer: other actions', () => {
  it('replaces only the section that was drafted', () => {
    const next = wizardReducer(initialWizardState, {
      type: 'draft',
      section: 'personal',
      values: validData.personal,
    })
    expect(next.data.personal).toEqual(validData.personal)
    expect(next.data.address).toEqual(initialWizardState.data.address)
  })

  it('jumps to a step, marks submitted and resets', () => {
    expect(wizardReducer(initialWizardState, { type: 'goTo', step: 2 }).step).toBe(2)
    expect(wizardReducer(stateAt(REVIEW_STEP, { returnToReview: true }), { type: 'goTo', step: 0 })).toMatchObject({
      step: 0,
      returnToReview: false,
    })
    expect(wizardReducer(initialWizardState, { type: 'submitted' }).submitted).toBe(true)
    expect(wizardReducer(stateAt(2), { type: 'reset' })).toEqual(initialWizardState)
  })
})

describe('isWizardState', () => {
  it('accepts a valid state and rejects malformed ones', () => {
    expect(isWizardState(initialWizardState)).toBe(true)
    expect(isWizardState({ ...initialWizardState, step: 9 })).toBe(false)
    expect(isWizardState({ ...initialWizardState, step: 1.5 })).toBe(false)
    expect(isWizardState({ step: 0 })).toBe(false)
    expect(isWizardState(null)).toBe(false)
  })
})
