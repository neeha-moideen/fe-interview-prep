import { apiJson, refreshAccessToken } from './apiClient'
import { userSchema, type User } from './schemas'
import { sessionHint } from './sessionHint'
import { tokenStore } from './tokenStore'

let restoring: Promise<User> | null = null

export function restoreSession(): Promise<User> {
  if (!restoring) {
    restoring = (async () => {
      if (!tokenStore.get()) {
        if (!sessionHint.has()) throw new Error('There is no session to restore')
        await refreshAccessToken()
      }
      return apiJson('/api/me', userSchema)
    })().finally(() => {
      restoring = null
    })
  }
  return restoring
}
