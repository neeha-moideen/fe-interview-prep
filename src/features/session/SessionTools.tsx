import { useState } from 'react'
import Button from '@/components/Button/Button'
import { tokenStore } from '@/features/auth/tokenStore'
import { useNow } from '@/lib/useNow'
import { expireAccessTokenNow, fireParallelRequests } from './sessionApi'

export default function SessionTools() {
  const now = useNow(1000)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string[] | null>(null)

  const expiresAt = tokenStore.getExpiresAt()
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const hasToken = tokenStore.get() !== null

  async function handleFire() {
    setRunning(true)
    try {
      setLastRun(await fireParallelRequests())
    } finally {
      setRunning(false)
    }
  }

  return (
    <section aria-label="Session tools" className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
      <h3>Session tools</h3>
      <p className="text-sm text-gray-600">
        The access token lasts 30 seconds. Expire it now, then fire three requests at once and watch the
        Network tab: three 401 responses, one refresh call, then three successful retries.
      </p>
      <p className="text-sm" aria-live="off">
        {hasToken
          ? secondsLeft > 0
            ? `Access token expires in ${secondsLeft}s`
            : 'Access token has expired. The next request will refresh it.'
          : 'No access token in memory'}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => void expireAccessTokenNow()}>
          Expire access token now
        </Button>
        <Button size="sm" disabled={running} onClick={() => void handleFire()}>
          {running ? 'Running...' : 'Fire 3 requests at once'}
        </Button>
      </div>
      {lastRun && (
        <p role="status" className="text-sm">
          Last run: {lastRun.join(', ')}
        </p>
      )}
    </section>
  )
}
