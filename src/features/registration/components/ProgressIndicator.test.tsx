import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProgressIndicator from './ProgressIndicator'

describe('ProgressIndicator', () => {
  it.each([
    [0, '1', 'w-1/3', 'Step 1 of 3: Personal info'],
    [1, '2', 'w-2/3', 'Step 2 of 3: Address'],
    [2, '3', 'w-full', 'Step 3 of 3: Preferences'],
    [3, '3', 'w-full', 'Review your details'],
  ])('shows step %i correctly', (step, valueNow, widthClass, text) => {
    render(<ProgressIndicator step={step} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', valueNow)
    expect(screen.getByTestId('progress-fill')).toHaveClass(widthClass)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('marks only the current step with aria-current', () => {
    render(<ProgressIndicator step={1} />)
    const current = screen.getAllByRole('listitem').filter((item) => item.getAttribute('aria-current') === 'step')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('2. Address')
  })
})
