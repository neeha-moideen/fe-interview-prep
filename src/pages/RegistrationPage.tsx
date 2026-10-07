import { useCallback, useState } from 'react'
import AddressStep from '@/features/registration/components/AddressStep'
import PersonalStep from '@/features/registration/components/PersonalStep'
import PreferencesStep from '@/features/registration/components/PreferencesStep'
import ProgressIndicator from '@/features/registration/components/ProgressIndicator'
import ReviewStep from '@/features/registration/components/ReviewStep'
import { PRIMARY_BUTTON } from '@/features/registration/components/styles'
import { submitRegistration } from '@/features/registration/registrationApi'
import {
  firstInvalidStep,
  type Address,
  type PersonalInfo,
  type Preferences,
} from '@/features/registration/schemas'
import {
  REVIEW_STEP,
  initialWizardState,
  isWizardState,
  wizardReducer,
  type WizardAction,
} from '@/features/registration/wizardReducer'
import { useLocalStorage } from '@/lib/useLocalStorage'

const STORAGE_KEY = 'fe-interview-prep:registration'

export default function RegistrationPage() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialWizardState, isWizardState)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const dispatch = useCallback(
    (action: WizardAction) => setState((current) => wizardReducer(current, action)),
    [setState],
  )
  const draftPersonal = useCallback(
    (values: PersonalInfo) => dispatch({ type: 'draft', section: 'personal', values }),
    [dispatch],
  )
  const draftAddress = useCallback(
    (values: Address) => dispatch({ type: 'draft', section: 'address', values }),
    [dispatch],
  )
  const draftPreferences = useCallback(
    (values: Preferences) => dispatch({ type: 'draft', section: 'preferences', values }),
    [dispatch],
  )
  const next = useCallback(() => dispatch({ type: 'next' }), [dispatch])
  const back = useCallback(() => dispatch({ type: 'back' }), [dispatch])

  async function handleSubmit() {
    const invalidStep = firstInvalidStep(state.data)
    if (invalidStep !== null) {
      dispatch({ type: 'goTo', step: invalidStep })
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitRegistration(state.data)
      dispatch({ type: 'submitted' })
    } catch {
      setSubmitError('Could not submit your registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (state.submitted) {
    return (
      <section className="space-y-4">
        <h2>Q3: Registration Wizard</h2>
        <div role="status" className="space-y-3 rounded-md border border-success p-4">
          <p className="font-medium text-success">Registration complete</p>
          <p className="text-sm text-gray-700">
            Thanks, {state.data.personal.name}. A confirmation will be sent to{' '}
            {state.data.personal.email}.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className={PRIMARY_BUTTON}
          >
            Start over
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h2>Q3: Registration Wizard</h2>
      <ProgressIndicator step={state.step} />
      {state.step === 0 && (
        <PersonalStep defaults={state.data.personal} onDraft={draftPersonal} onNext={next} />
      )}
      {state.step === 1 && (
        <AddressStep
          defaults={state.data.address}
          onDraft={draftAddress}
          onNext={next}
          onBack={back}
        />
      )}
      {state.step === 2 && (
        <PreferencesStep
          defaults={state.data.preferences}
          onDraft={draftPreferences}
          onNext={next}
          onBack={back}
        />
      )}
      {state.step === REVIEW_STEP && (
        <ReviewStep
          data={state.data}
          submitting={submitting}
          error={submitError}
          onEdit={(step) => dispatch({ type: 'edit', step })}
          onBack={back}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
