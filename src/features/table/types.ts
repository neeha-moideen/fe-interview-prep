import type { ReactNode } from 'react'

export const PAGE_SIZES = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]
export const DEFAULT_PAGE_SIZE: PageSize = 10

export type SortDirection = 'asc' | 'desc'

export interface ColumnMeta {
  id: string
  sortable?: boolean
  filterable?: boolean
}

export interface Column<T> extends ColumnMeta {
  header: string
  accessor: (row: T) => string | number
  cell?: (row: T) => ReactNode
  searchable?: boolean
  align?: 'left' | 'right'
}

export interface TableSort {
  columnId: string
  direction: SortDirection
}

export interface TableView {
  search: string
  sort: TableSort | null
  filters: Record<string, string>
  page: number
  pageSize: PageSize
}

export type TableAction =
  | { type: 'sort'; columnId: string }
  | { type: 'search'; value: string }
  | { type: 'filter'; columnId: string; value: string }
  | { type: 'page'; page: number }
  | { type: 'pageSize'; pageSize: PageSize }
  | { type: 'clearFilters' }
