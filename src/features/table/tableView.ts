import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  type ColumnMeta,
  type TableAction,
  type TableSort,
  type TableView,
} from './types'

export const DEFAULT_VIEW: TableView = {
  search: '',
  sort: null,
  filters: {},
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

function nextSort(current: TableSort | null, columnId: string): TableSort | null {
  if (current?.columnId !== columnId) return { columnId, direction: 'asc' }
  if (current.direction === 'asc') return { columnId, direction: 'desc' }
  return null
}

export function reduceView(view: TableView, action: TableAction): TableView {
  switch (action.type) {
    case 'sort':
      return { ...view, sort: nextSort(view.sort, action.columnId), page: 1 }
    case 'search':
      return { ...view, search: action.value, page: 1 }
    case 'filter': {
      const filters = Object.fromEntries(
        Object.entries(view.filters).filter(([columnId]) => columnId !== action.columnId),
      )
      if (action.value !== '') filters[action.columnId] = action.value
      return { ...view, filters, page: 1 }
    }
    case 'page':
      return { ...view, page: Math.max(1, Math.floor(action.page)) }
    case 'pageSize':
      return { ...view, pageSize: action.pageSize, page: 1 }
    case 'clearFilters':
      return { ...view, search: '', filters: {}, page: 1 }
  }
}

function positiveInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= 1 ? parsed : null
}

export function parseView(params: URLSearchParams, columns: readonly ColumnMeta[]): TableView {
  const sortColumn = columns.find(
    (column) => column.id === params.get('sort') && column.sortable !== false,
  )
  const filters: Record<string, string> = {}
  for (const column of columns) {
    if (!column.filterable) continue
    const value = params.get(`f.${column.id}`)
    if (value) filters[column.id] = value
  }
  const size = positiveInteger(params.get('size'))

  return {
    search: params.get('q') ?? '',
    sort: sortColumn
      ? { columnId: sortColumn.id, direction: params.get('dir') === 'desc' ? 'desc' : 'asc' }
      : null,
    filters,
    page: positiveInteger(params.get('page')) ?? 1,
    pageSize: PAGE_SIZES.find((option) => option === size) ?? DEFAULT_PAGE_SIZE,
  }
}

export function serializeView(view: TableView, columns: readonly ColumnMeta[]): URLSearchParams {
  const params = new URLSearchParams()
  if (view.search !== '') params.set('q', view.search)
  if (view.sort) {
    params.set('sort', view.sort.columnId)
    params.set('dir', view.sort.direction)
  }
  for (const column of columns) {
    const value = view.filters[column.id]
    if (value) params.set(`f.${column.id}`, value)
  }
  if (view.page > 1) params.set('page', String(view.page))
  if (view.pageSize !== DEFAULT_PAGE_SIZE) params.set('size', String(view.pageSize))
  return params
}
