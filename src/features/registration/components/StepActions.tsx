import { PRIMARY_BUTTON, SECONDARY_BUTTON } from './styles'

interface StepActionsProps {
  nextLabel: string
  onBack?: () => void
}

export default function StepActions({ nextLabel, onBack }: StepActionsProps) {
  return (
    <div className="flex justify-between pt-2">
      {onBack ? (
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>
          Back
        </button>
      ) : (
        <span />
      )}
      <button type="submit" className={PRIMARY_BUTTON}>
        {nextLabel}
      </button>
    </div>
  )
}
