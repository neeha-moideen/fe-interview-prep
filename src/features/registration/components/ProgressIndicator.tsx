import { cn } from '@/lib/cn'
import { REVIEW_STEP, STEP_LABELS } from '../wizardReducer'

interface ProgressIndicatorProps {
  step: number
}

const BAR_WIDTH = ['w-1/3', 'w-2/3', 'w-full', 'w-full'] as const

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
          data-testid="progress-fill"
          className={cn('h-full bg-primary transition-all', BAR_WIDTH[Math.min(step, REVIEW_STEP)])}
        />
      </div>
      <ol className="flex justify-between text-xs text-gray-500">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? 'step' : undefined}
            className={cn(index <= step && 'font-medium text-primary')}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
    </div>
  )
}
