import { useCallback, useMemo } from 'react'
import Button from '@/components/Button/Button'
import { cn } from '@/lib/cn'
import { computeTable, distinctValues } from '../tableData'
import type { Column, TableAction, TableView } from '../types'
import SearchBox from './SearchBox'
import TablePagination from './TablePagination'

interface DataTableProps<T> {
  rows: readonly T[]
  columns: readonly Column<T>[]
  getRowId: (row: T) => string | number
  view: TableView
  onAction: (action: TableAction) => void
  caption: string
}

type SortState = 'ascending' | 'descending' | 'none'

function sortState(columnId: string, view: TableView): SortState {
  if (view.sort?.columnId !== columnId) return 'none'
  return view.sort.direction === 'asc' ? 'ascending' : 'descending'
}

const SORT_INDICATOR: Record<SortState, string> = { ascending: '↑', descending: '↓', none: '↕' }

export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  view,
  onAction,
  caption,
}: DataTableProps<T>) {
  const result = useMemo(() => computeTable(rows, columns, view), [rows, columns, view])
  const filterColumns = useMemo(() => columns.filter((column) => column.filterable), [columns])
  const filterOptions = useMemo(
    () => Object.fromEntries(filterColumns.map((column) => [column.id, distinctValues(rows, column)])),
    [rows, filterColumns],
  )
  const commitSearch = useCallback(
    (value: string) => onAction({ type: 'search', value }),
    [onAction],
  )
  const filtersActive = view.search.trim() !== '' || Object.keys(view.filters).length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1 sm:max-w-sm">
          <SearchBox
            label="Search"
            placeholder="Search all columns"
            value={view.search}
            onCommit={commitSearch}
          />
        </div>
        {filterColumns.map((column) => {
          const selected = view.filters[column.id] ?? ''
          const options = filterOptions[column.id]
          const choices = selected === '' || options.includes(selected) ? options : [...options, selected]
          return (
            <label key={column.id} className="flex flex-col gap-1 text-sm font-medium">
              {column.header}
              <select
                aria-label={`Filter by ${column.header}`}
                value={selected}
                onChange={(event) =>
                  onAction({ type: 'filter', columnId: column.id, value: event.target.value })
                }
                className="rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All</option>
                {choices.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </label>
          )
        })}
        {filtersActive && (
          <Button variant="ghost" className="py-2" onClick={() => onAction({ type: 'clearFilters' })}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => {
                const sortable = column.sortable !== false
                const state = sortState(column.id, view)
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={sortable ? state : undefined}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 font-medium',
                      column.align === 'right' ? 'text-right' : 'text-left',
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onAction({ type: 'sort', columnId: column.id })}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          state !== 'none' && 'text-primary',
                        )}
                      >
                        {column.header}
                        <span
                          aria-hidden="true"
                          className={state === 'none' ? 'text-gray-300' : 'text-primary'}
                        >
                          {SORT_INDICATOR[state]}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">
                  No rows match your search or filters.
                </td>
              </tr>
            ) : (
              result.rows.map((row) => (
                <tr key={getRowId(row)} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'whitespace-nowrap px-4 py-2.5',
                        column.align === 'right' && 'text-right tabular-nums',
                      )}
                    >
                      {column.cell ? column.cell(row) : column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p aria-live="polite" className="text-sm text-gray-600">
        Showing {result.firstItem}–{result.lastItem} of {result.matchCount} results
        {result.matchCount !== rows.length && ` (filtered from ${rows.length})`}
      </p>

      <TablePagination
        page={result.page}
        totalPages={result.totalPages}
        pageSize={view.pageSize}
        onPageChange={(page) => onAction({ type: 'page', page })}
        onPageSizeChange={(pageSize) => onAction({ type: 'pageSize', pageSize })}
      />
    </div>
  )
}
