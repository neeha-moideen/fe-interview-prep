import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseView, reduceView, serializeView } from './tableView'
import type { Column, TableAction } from './types'

export function useTableUrlState<T>(columns: readonly Column<T>[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = useMemo(() => parseView(searchParams, columns), [searchParams, columns])

  const dispatch = useCallback(
    (action: TableAction) => {
      const params = serializeView(reduceView(view, action), columns)
      if (params.toString() === searchParams.toString()) return
      const refiningSearch = action.type === 'search' && view.search !== ''
      setSearchParams(params, { replace: refiningSearch })
    },
    [view, columns, searchParams, setSearchParams],
  )

  return { view, dispatch }
}
