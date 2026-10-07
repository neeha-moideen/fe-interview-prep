import { z } from 'zod'

export const roleSchema = z.enum(['user', 'admin'])
export type Role = z.infer<typeof roleSchema>

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  role: roleSchema,
})
export type User = z.infer<typeof userSchema>

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
})

export const loginResponseSchema = tokenResponseSchema.extend({ user: userSchema })
