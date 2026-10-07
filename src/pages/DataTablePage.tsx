import Button from '@/components/Button/Button'
import DataTable from '@/features/table/components/DataTable'
import { useTableUrlState } from '@/features/table/useTableUrlState'
import { userColumns } from '@/features/users/userColumns'
import { fetchUsers } from '@/features/users/usersApi'
import { useFetchedData } from '@/lib/useFetchedData'

export default function DataTablePage() {
  const { state, retry } = useFetchedData(fetchUsers)
  const { view, dispatch } = useTableUrlState(userColumns)

  return (
    <section className="space-y-4">
      <h2>Q4: Data Table</h2>

      {state.status === 'loading' && (
        <p role="status" className="py-6 text-center text-gray-500">
          Loading users...
        </p>
      )}

      {state.status === 'error' && (
        <div role="alert" className="space-y-2 rounded-md border border-error p-4">
          <p className="text-error">{state.message}</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      )}

      {state.status === 'success' && (
        <DataTable
          rows={state.data}
          columns={userColumns}
          getRowId={(user) => user.id}
          view={view}
          onAction={dispatch}
          caption="Users"
        />
      )}
    </section>
  )
}
