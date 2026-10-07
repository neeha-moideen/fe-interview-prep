import { useState } from 'react'
import Highlight from '@/features/search/components/Highlight'
import { useProductSearch } from '@/features/search/useProductSearch'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { state, debouncedQuery, retry } = useProductSearch(query)

  return (
    <section className="space-y-4">
      <h2>Live Search</h2>
      <input
        type="search"
        aria-label="Search products"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products, e.g. phone"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {state.status === 'idle' && (
        <p className="py-6 text-center text-gray-500">Type to search products.</p>
      )}

      {state.status === 'loading' && (
        <p role="status" className="py-6 text-center text-gray-500">
          Loading...
        </p>
      )}

      {state.status === 'error' && (
        <div role="alert" className="space-y-2 rounded-md border border-error p-4">
          <p className="text-error">{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Retry
          </button>
        </div>
      )}

      {state.status === 'success' && state.products.length === 0 && (
        <p className="py-6 text-center text-gray-500">{`No results for '${debouncedQuery}'`}</p>
      )}

      {state.status === 'success' && state.products.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {state.products.map((product) => (
            <li key={product.id} className="py-3">
              <p className="font-medium">
                <Highlight text={product.title} query={debouncedQuery} />
              </p>
              <p className="text-sm text-gray-600">
                <Highlight text={product.description} query={debouncedQuery} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
