import { useEffect, useState } from 'react'

type Outcome<T> = { ok: true; data: T } | { ok: false; message: string }

export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

export function useFetchedData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<{ attempt: number; outcome: Outcome<T> } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ attempt, outcome: { ok: true, data } })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Something went wrong'
        setSettled({ attempt, outcome: { ok: false, message } })
      })

    return () => controller.abort()
  }, [attempt, load])

  let state: FetchState<T>
  if (settled?.attempt !== attempt) state = { status: 'loading' }
  else if (settled.outcome.ok) state = { status: 'success', data: settled.outcome.data }
  else state = { status: 'error', message: settled.outcome.message }

  return { state, retry: () => setAttempt((count) => count + 1) }
}
