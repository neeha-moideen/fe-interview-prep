import type { RegistrationData } from './schemas'

export const SUBMIT_DELAY_MS = 800

export function submitRegistration(data: RegistrationData): Promise<{ id: string }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: `${data.personal.email}-${Date.now()}` }), SUBMIT_DELAY_MS)
  })
}
