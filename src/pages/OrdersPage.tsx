import Button from '@/components/Button/Button'
import { loadOrders } from '@/features/session/sessionApi'
import SessionTools from '@/features/session/SessionTools'
import { useFetchedData } from '@/lib/useFetchedData'

const CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function OrdersPage() {
  const { state, retry } = useFetchedData(loadOrders)

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h3>Your orders</h3>

        {state.status === 'loading' && (
          <p role="status" className="py-6 text-center text-gray-500">
            Loading orders...
          </p>
        )}

        {state.status === 'error' && (
          <div role="alert" className="space-y-2 rounded-md border border-error p-4">
            <p className="text-error">{state.message}</p>
            <Button onClick={retry}>Retry</Button>
          </div>
        )}

        {state.status === 'success' && (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <caption className="sr-only">Orders</caption>
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Item</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.data.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-2.5">#{order.id}</td>
                    <td className="px-4 py-2.5">{order.item}</td>
                    <td className="px-4 py-2.5 capitalize">{order.status}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{CURRENCY.format(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SessionTools />
    </section>
  )
}
