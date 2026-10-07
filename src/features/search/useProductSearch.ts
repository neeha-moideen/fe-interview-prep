import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { searchProducts } from './searchApi'
import type { Product, SearchState } from './types'

export const SEARCH_DELAY_MS = 400

type Settled =
  | { key: string; products: Product[]; message?: undefined }
  | { key: string; message: string; products?: undefined }

export function useProductSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DELAY_MS)
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled | null>(null)
  const requestKey = `${debouncedQuery}#${attempt}`

  useEffect(() => {
    if (!debouncedQuery) return
    const controller = new AbortController()

    searchProducts(debouncedQuery, controller.signal)
      .then((products) => {
        if (controller.signal.aborted) return
        setSettled({ key: requestKey, products })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Something went wrong'
        setSettled({ key: requestKey, message })
      })

    return () => controller.abort()
  }, [debouncedQuery, requestKey])

  let state: SearchState
  if (!debouncedQuery) state = { status: 'idle' }
  else if (settled?.key !== requestKey) state = { status: 'loading' }
  else if (settled.message !== undefined) state = { status: 'error', message: settled.message }
  else state = { status: 'success', products: settled.products }

  return { state, debouncedQuery, retry: () => setAttempt((count) => count + 1) }
}
