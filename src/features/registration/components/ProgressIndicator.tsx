import { REVIEW_STEP, STEP_LABELS } from '../wizardReducer'

interface ProgressIndicatorProps {
  step: number
}

export default function ProgressIndicator({ step }: ProgressIndicatorProps) {
  const total = STEP_LABELS.length
  const current = Math.min(step + 1, total)
  const reviewing = step >= REVIEW_STEP

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        {reviewing ? 'Review your details' : `Step ${current} of ${total}: ${STEP_LABELS[step]}`}
      </p>
      <div
        role="progressbar"
        aria-label="Registration progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-2 w-full overflow-hidden rounded bg-gray-200"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${reviewing ? 100 : (current / total) * 100}%` }}
        />
      </div>
      <ol className="flex justify-between text-xs text-gray-500">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? 'step' : undefined}
            className={index <= step ? 'font-medium text-primary' : ''}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
    </div>
  )
}
