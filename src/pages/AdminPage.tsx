import Button from '@/components/Button/Button'
import { loadAdminStats } from '@/features/session/sessionApi'
import { useFetchedData } from '@/lib/useFetchedData'

const CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function AdminPage() {
  const { state, retry } = useFetchedData(loadAdminStats)

  return (
    <section className="space-y-3">
      <h3>Platform stats</h3>

      {state.status === 'loading' && (
        <p role="status" className="py-6 text-center text-gray-500">
          Loading stats...
        </p>
      )}

      {state.status === 'error' && (
        <div role="alert" className="space-y-2 rounded-md border border-error p-4">
          <p className="text-error">{state.message}</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      )}

      {state.status === 'success' && (
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Total orders', String(state.data.totalOrders)],
            ['Revenue', CURRENCY.format(state.data.revenue)],
            ['Users', String(state.data.users)],
            ['Active sessions', String(state.data.activeSessions)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-gray-200 p-4">
              <dt className="text-sm text-gray-600">{label}</dt>
              <dd className="text-xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
