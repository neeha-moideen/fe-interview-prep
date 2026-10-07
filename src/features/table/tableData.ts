import type { Column, TableView } from './types'

export interface TableResult<T> {
  rows: T[]
  matchCount: number
  page: number
  totalPages: number
  firstItem: number
  lastItem: number
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return compareText(String(a), String(b))
}

export function distinctValues<T>(rows: readonly T[], column: Column<T>): string[] {
  return Array.from(new Set(rows.map((row) => String(column.accessor(row))))).sort(compareText)
}

function filterRows<T>(rows: readonly T[], columns: readonly Column<T>[], view: TableView): T[] {
  const active = Object.entries(view.filters)
    .map(([columnId, value]) => ({
      column: columns.find((column) => column.id === columnId && column.filterable),
      value,
    }))
    .filter((entry) => entry.column !== undefined)

  return rows.filter((row) =>
    active.every(({ column, value }) => String(column?.accessor(row)) === value),
  )
}

function searchRows<T>(rows: T[], columns: readonly Column<T>[], search: string): T[] {
  const tokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return rows

  const searchable = columns.filter((column) => column.searchable !== false)
  return rows.filter((row) => {
    const haystack = searchable.map((column) => String(column.accessor(row))).join(' ').toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}

function sortRows<T>(rows: T[], columns: readonly Column<T>[], sort: TableView['sort']): T[] {
  const column = sort && columns.find((candidate) => candidate.id === sort.columnId)
  if (!sort || !column || column.sortable === false) return rows

  const direction = sort.direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => direction * compareValues(column.accessor(a), column.accessor(b)))
}

export function computeTable<T>(
  rows: readonly T[],
  columns: readonly Column<T>[],
  view: TableView,
): TableResult<T> {
  const matches = sortRows(
    searchRows(filterRows(rows, columns, view), columns, view.search),
    columns,
    view.sort,
  )
  const totalPages = Math.max(1, Math.ceil(matches.length / view.pageSize))
  const page = Math.min(Math.max(view.page, 1), totalPages)
  const start = (page - 1) * view.pageSize

  return {
    rows: matches.slice(start, start + view.pageSize),
    matchCount: matches.length,
    page,
    totalPages,
    firstItem: matches.length === 0 ? 0 : start + 1,
    lastItem: Math.min(start + view.pageSize, matches.length),
  }
}
