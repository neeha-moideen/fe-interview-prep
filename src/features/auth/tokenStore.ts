let accessToken: string | null = null
let expiresAt = 0

export const tokenStore = {
  get: (): string | null => accessToken,
  getExpiresAt: (): number => expiresAt,
  set(token: string, expiresInSeconds: number) {
    accessToken = token
    expiresAt = Date.now() + expiresInSeconds * 1000
  },
  clear() {
    accessToken = null
    expiresAt = 0
  },
}
