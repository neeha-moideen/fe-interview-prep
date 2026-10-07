import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('is a plain button by default so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('can be a submit button', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit')
  })

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'border-gray-300'],
    ['ghost', 'text-primary'],
    ['danger', 'text-error'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass(expectedClass)
  })

  it('applies the size variant', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('px-2')
  })

  it('lets a className override a conflicting variant class', () => {
    render(<Button className="px-8">Wide</Button>)
    const button = screen.getByRole('button', { name: 'Wide' })
    expect(button).toHaveClass('px-8')
    expect(button).not.toHaveClass('px-4')
  })

  it('calls onClick, and not when disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Press</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Press' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Press
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Press' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
