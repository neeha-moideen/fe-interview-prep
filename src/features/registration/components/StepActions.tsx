import Button from '@/components/Button/Button'

interface StepActionsProps {
  nextLabel: string
  onBack?: () => void
}

export default function StepActions({ nextLabel, onBack }: StepActionsProps) {
  return (
    <div className="flex justify-between pt-2">
      {onBack ? (
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit">{nextLabel}</Button>
    </div>
  )
}
