export interface Product {
  id: number
  title: string
  description: string
  category: string
}

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] }
