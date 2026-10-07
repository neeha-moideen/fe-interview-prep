import { describe, expect, it } from 'vitest'
import {
  REVIEW_STEP,
  initialWizardState,
  isWizardState,
  wizardReducer,
  type WizardState,
} from './wizardReducer'

const personal = { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' }

describe('wizardReducer', () => {
  it('moves forward and back within bounds', () => {
    let state = initialWizardState
    state = wizardReducer(state, { type: 'next' })
    state = wizardReducer(state, { type: 'next' })
    state = wizardReducer(state, { type: 'next' })
    state = wizardReducer(state, { type: 'next' })
    expect(state.step).toBe(REVIEW_STEP)

    expect(wizardReducer(initialWizardState, { type: 'back' }).step).toBe(0)
    expect(wizardReducer(state, { type: 'back' }).step).toBe(REVIEW_STEP - 1)
  })

  it('keeps entered values when going back', () => {
    let state = wizardReducer(initialWizardState, { type: 'draft', section: 'personal', values: personal })
    state = wizardReducer(state, { type: 'next' })
    state = wizardReducer(state, { type: 'back' })
    expect(state.data.personal).toEqual(personal)
  })

  it('returns to the review step after editing from it', () => {
    let state: WizardState = { ...initialWizardState, step: REVIEW_STEP }
    state = wizardReducer(state, { type: 'edit', step: 1 })
    expect(state).toMatchObject({ step: 1, returnToReview: true })

    state = wizardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ step: REVIEW_STEP, returnToReview: false })
  })

  it('jumps to a step, marks submitted and resets', () => {
    expect(wizardReducer(initialWizardState, { type: 'goTo', step: 2 }).step).toBe(2)
    expect(wizardReducer(initialWizardState, { type: 'submitted' }).submitted).toBe(true)
    const dirty = wizardReducer(initialWizardState, { type: 'draft', section: 'personal', values: personal })
    expect(wizardReducer(dirty, { type: 'reset' })).toEqual(initialWizardState)
  })
})

describe('isWizardState', () => {
  it('accepts a valid state and rejects malformed ones', () => {
    expect(isWizardState(initialWizardState)).toBe(true)
    expect(isWizardState({ ...initialWizardState, step: 9 })).toBe(false)
    expect(isWizardState({ step: 0 })).toBe(false)
    expect(isWizardState(null)).toBe(false)
  })
})
