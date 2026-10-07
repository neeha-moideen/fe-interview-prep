import { PLANS, type RegistrationData } from '../schemas'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from './styles'

interface ReviewStepProps {
  data: RegistrationData
  submitting: boolean
  error: string | null
  onEdit: (step: number) => void
  onBack: () => void
  onSubmit: () => void
}

interface ReviewSectionProps {
  title: string
  editLabel: string
  onEdit: () => void
  rows: { label: string; value: string }[]
}

function ReviewSection({ title, editLabel, onEdit, rows }: ReviewSectionProps) {
  return (
    <section className="space-y-2 rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3>{title}</h3>
        <button
          type="button"
          aria-label={editLabel}
          onClick={onEdit}
          className="rounded px-2 py-1 text-sm text-primary hover:bg-gray-100"
        >
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-gray-600">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function ReviewStep({
  data,
  submitting,
  error,
  onEdit,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  const planLabel = PLANS.find((plan) => plan.value === data.preferences.plan)?.label ?? ''

  return (
    <div className="space-y-4">
      <ReviewSection
        title="Personal info"
        editLabel="Edit personal info"
        onEdit={() => onEdit(0)}
        rows={[
          { label: 'Name', value: data.personal.name },
          { label: 'Email', value: data.personal.email },
          { label: 'Phone', value: data.personal.phone },
        ]}
      />
      <ReviewSection
        title="Address"
        editLabel="Edit address"
        onEdit={() => onEdit(1)}
        rows={[
          { label: 'Country', value: data.address.country },
          { label: 'City', value: data.address.city },
          { label: 'Postal code', value: data.address.postalCode },
        ]}
      />
      <ReviewSection
        title="Preferences"
        editLabel="Edit preferences"
        onEdit={() => onEdit(2)}
        rows={[
          { label: 'Plan', value: planLabel },
          { label: 'Skills', value: data.preferences.skills.join(', ') },
        ]}
      />
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} disabled={submitting} className={SECONDARY_BUTTON}>
          Back
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting} className={PRIMARY_BUTTON}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
