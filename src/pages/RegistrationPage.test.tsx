import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitRegistration } from '@/features/registration/registrationApi'
import RegistrationPage from '@/pages/RegistrationPage'

vi.mock('@/features/registration/registrationApi', () => ({
  submitRegistration: vi.fn(),
}))

const submitMock = vi.mocked(submitRegistration)

async function fillPersonal() {
  await userEvent.type(screen.getByLabelText('Full name'), 'Asha Rao')
  await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com')
  await userEvent.type(screen.getByLabelText('Phone'), '+91 98765 43210')
}

async function fillAddress(country = 'India', postalCode = '682001') {
  await userEvent.selectOptions(screen.getByLabelText('Country'), country)
  await userEvent.type(screen.getByLabelText('City'), 'Kochi')
  await userEvent.type(screen.getByLabelText('Postal code'), postalCode)
}

async function fillPreferences() {
  await userEvent.click(screen.getByLabelText('Pro'))
  await userEvent.type(screen.getByLabelText('Skills'), 'React')
  await userEvent.click(screen.getByRole('button', { name: 'Add skill' }))
}

async function next(label = 'Next') {
  await userEvent.click(screen.getByRole('button', { name: label }))
}

async function reachReview() {
  await fillPersonal()
  await next()
  await fillAddress()
  await next()
  await fillPreferences()
  await next('Review')
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    submitMock.mockReset()
    submitMock.mockResolvedValue({ id: 'abc' })
  })

  it('starts on step 1 with a progress indicator', () => {
    render(<RegistrationPage />)
    expect(screen.getByText('Step 1 of 3: Personal info')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
  })

  it('blocks moving on from an invalid step and shows clear errors', async () => {
    render(<RegistrationPage />)
    await next()

    expect(await screen.findByText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3: Personal info')).toBeInTheDocument()
  })

  it('moves to the next step once the current one is valid', async () => {
    render(<RegistrationPage />)
    await fillPersonal()
    await next()

    expect(await screen.findByText('Step 2 of 3: Address')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })

  it('keeps what the user entered when going back', async () => {
    render(<RegistrationPage />)
    await fillPersonal()
    await next()
    await fillAddress()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByLabelText('Full name')).toHaveValue('Asha Rao')
    await next()
    expect(await screen.findByLabelText('Postal code')).toHaveValue('682001')
  })

  it('requires a 6 digit postal code for India', async () => {
    render(<RegistrationPage />)
    await fillPersonal()
    await next()
    await fillAddress('India', '123')
    await next()

    expect(await screen.findByText('Indian postal codes must be 6 digits')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 3: Address')).toBeInTheDocument()
  })

  it('accepts any postal code for other countries', async () => {
    render(<RegistrationPage />)
    await fillPersonal()
    await next()
    await fillAddress('United Kingdom', 'SW1A 1AA')
    await next()

    expect(await screen.findByText('Step 3 of 3: Preferences')).toBeInTheDocument()
  })

  it('requires at least one skill and lets the user remove one', async () => {
    render(<RegistrationPage />)
    await fillPersonal()
    await next()
    await fillAddress()
    await next()

    await userEvent.click(screen.getByLabelText('Pro'))
    await next('Review')
    expect(await screen.findByText('Add at least one skill')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Skills'), 'React')
    await userEvent.click(screen.getByRole('button', { name: 'Add skill' }))
    expect(screen.getByText('React')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove React' }))
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('shows everything on the review step and submits successfully', async () => {
    render(<RegistrationPage />)
    await reachReview()

    expect(await screen.findByText('Review your details')).toBeInTheDocument()
    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText('asha@example.com')).toBeInTheDocument()
    expect(screen.getByText('Kochi')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByText('Registration complete')).toBeInTheDocument()
    expect(submitMock).toHaveBeenCalledTimes(1)
    expect(submitMock.mock.calls[0][0].personal.name).toBe('Asha Rao')
  })

  it('edits a section from the review step and returns to review', async () => {
    render(<RegistrationPage />)
    await reachReview()

    await userEvent.click(await screen.findByRole('button', { name: 'Edit address' }))
    const city = await screen.findByLabelText('City')
    await userEvent.clear(city)
    await userEvent.type(city, 'Mumbai')
    await next()

    expect(await screen.findByText('Review your details')).toBeInTheDocument()
    expect(screen.getByText('Mumbai')).toBeInTheDocument()
  })

  it('shows an error and stays on review when submitting fails', async () => {
    submitMock.mockRejectedValueOnce(new Error('network'))
    render(<RegistrationPage />)
    await reachReview()

    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not submit')
    expect(screen.getByText('Review your details')).toBeInTheDocument()
  })

  it('keeps progress and half-typed values after a refresh', async () => {
    const first = render(<RegistrationPage />)
    await fillPersonal()
    await next()
    await userEvent.type(await screen.findByLabelText('City'), 'Koch')
    first.unmount()

    render(<RegistrationPage />)
    expect(screen.getByText('Step 2 of 3: Address')).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toHaveValue('Koch')
  })
})
