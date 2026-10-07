const COUNTRIES = ['United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany']

export interface RawUser {
  login: { uuid: string }
  name: { first: string; last: string }
  email: string
  gender: string
  location: { city: string; country: string }
  dob: { age: number }
}

export function rawUsers(count: number): RawUser[] {
  return Array.from({ length: count }, (_, index) => ({
    login: { uuid: `uuid-${index}` },
    name: { first: `First${index}`, last: `Last${index % 7}` },
    email: `user${index}@example.com`,
    gender: index % 2 === 0 ? 'female' : 'male',
    location: { city: `City${index % 11}`, country: COUNTRIES[index % COUNTRIES.length] },
    dob: { age: 20 + (index % 50) },
  }))
}

export function okUsersResponse(count: number): Response {
  return { ok: true, status: 200, json: async () => ({ results: rawUsers(count) }) } as Response
}
