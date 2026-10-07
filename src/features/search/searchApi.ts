import type { Product } from './types'

const ENDPOINT = 'https://dummyjson.com/products/search'

interface SearchResponse {
  products: Product[]
}

export async function searchProducts(query: string, signal: AbortSignal): Promise<Product[]> {
  const response = await fetch(`${ENDPOINT}?q=${encodeURIComponent(query)}`, { signal })
  if (!response.ok) throw new Error(`Search failed with status ${response.status}`)
  const data = (await response.json()) as SearchResponse
  return data.products
}
