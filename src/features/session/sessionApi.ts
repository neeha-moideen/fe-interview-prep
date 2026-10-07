import { z } from 'zod'
import { apiFetch, apiJson } from '@/features/auth/apiClient'
import { userSchema } from '@/features/auth/schemas'

const orderSchema = z.object({
  id: z.number(),
  item: z.string(),
  total: z.number(),
  status: z.enum(['processing', 'shipped', 'delivered']),
  placedAt: z.string(),
})
export type Order = z.infer<typeof orderSchema>
const ordersSchema = z.array(orderSchema)

const statsSchema = z.object({
  totalOrders: z.number(),
  revenue: z.number(),
  users: z.number(),
  activeSessions: z.number(),
})
export type AdminStats = z.infer<typeof statsSchema>

export function loadOrders(signal: AbortSignal): Promise<Order[]> {
  return apiJson('/api/orders', ordersSchema, { signal })
}

export function loadAdminStats(signal: AbortSignal): Promise<AdminStats> {
  return apiJson('/api/admin/stats', statsSchema, { signal })
}

export async function expireAccessTokenNow(): Promise<void> {
  await apiFetch('/api/debug/expire-access-token', { method: 'POST' })
}

export async function fireParallelRequests(): Promise<string[]> {
  const results = await Promise.allSettled([
    apiJson('/api/me', userSchema),
    apiJson('/api/orders', ordersSchema),
    apiJson('/api/orders', ordersSchema),
  ])
  return results.map((result) => (result.status === 'fulfilled' ? 'ok' : result.reason.message))
}
