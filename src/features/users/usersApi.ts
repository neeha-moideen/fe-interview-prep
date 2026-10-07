import { z } from 'zod'
import type { UserRow } from './types'

export const USER_COUNT = 600

const ENDPOINT = 'https://randomuser.me/api/'

const responseSchema = z.object({
  results: z.array(
    z.object({
      login: z.object({ uuid: z.string() }),
      name: z.object({ first: z.string(), last: z.string() }),
      email: z.string(),
      gender: z.string(),
      location: z.object({ city: z.string(), country: z.string() }),
      dob: z.object({ age: z.number() }),
    }),
  ),
})

export function usersUrl(): string {
  const params = new URLSearchParams({
    results: String(USER_COUNT),
    seed: 'fe-interview-prep',
    nat: 'us,gb,in,ca,au,de',
    inc: 'login,name,email,gender,location,dob',
  })
  return `${ENDPOINT}?${params.toString()}`
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export async function fetchUsers(signal: AbortSignal): Promise<UserRow[]> {
  const response = await fetch(usersUrl(), { signal })
  if (!response.ok) throw new Error(`Could not load users (status ${response.status})`)

  const parsed = responseSchema.safeParse(await response.json())
  if (!parsed.success) throw new Error('The users service returned unexpected data')

  return parsed.data.results.map((user) => ({
    id: user.login.uuid,
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    gender: capitalize(user.gender),
    country: user.location.country,
    city: user.location.city,
    age: user.dob.age,
  }))
}
