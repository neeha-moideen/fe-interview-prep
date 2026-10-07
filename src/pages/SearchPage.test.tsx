import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '@/features/search/types'
import SearchPage from '@/pages/SearchPage'

const fetchMock = vi.fn()

function product(id: number, title: string): Product {
  return { id, title, description: `About ${title}`, category: 'misc' }
}

function okResponse(products: Product[]) {
  return { ok: true, status: 200, json: async () => ({ products }) } as Response
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

async function search(text: string) {
  await userEvent.type(screen.getByLabelText('Search products'), text)
}

describe('SearchPage', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('asks the user to type before searching', () => {
    render(<SearchPage />)
    expect(screen.getByText('Type to search products.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a single request when the user types quickly', async () => {
    fetchMock.mockResolvedValue(okResponse([product(1, 'React Handbook')]))
    render(<SearchPage />)
    await search('react')

    await screen.findByText('Handbook')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('https://dummyjson.com/products/search?q=react')
  })

  it('highlights the matched text in each result', async () => {
    fetchMock.mockResolvedValue(okResponse([product(1, 'React Handbook')]))
    render(<SearchPage />)
    await search('react')

    const marks = await screen.findAllByText('React', { selector: 'mark' })
    expect(marks.length).toBeGreaterThan(0)
  })

  it('shows the empty state with the query', async () => {
    fetchMock.mockResolvedValue(okResponse([]))
    render(<SearchPage />)
    await search('xyz')

    expect(await screen.findByText("No results for 'xyz'")).toBeInTheDocument()
  })

  it('shows an error and recovers with Retry', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response)
    fetchMock.mockResolvedValueOnce(okResponse([product(2, 'Phone Case')]))
    render(<SearchPage />)
    await search('phone')

    expect(await screen.findByRole('alert')).toHaveTextContent('Search failed with status 500')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Case')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('ignores a late response for an older query', async () => {
    const early = deferred<Response>()
    const latest = deferred<Response>()
    fetchMock.mockReturnValueOnce(early.promise).mockReturnValueOnce(latest.promise)
    render(<SearchPage />)

    await search('re')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await search('act')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    latest.resolve(okResponse([product(2, 'Latest Result')]))
    expect(await screen.findByText('Latest Result')).toBeInTheDocument()

    early.resolve(okResponse([product(1, 'Stale Result')]))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText('Stale Result')).not.toBeInTheDocument()
    expect(screen.getByText('Latest Result')).toBeInTheDocument()
  })
})
