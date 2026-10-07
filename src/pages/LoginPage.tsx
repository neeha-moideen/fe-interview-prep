import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button/Button'
import { ApiError } from '@/features/auth/authApi'
import { useAuth } from '@/features/auth/useAuth'
import Field from '@/features/registration/components/Field'
import { INPUT_CLASS } from '@/features/registration/components/styles'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { status, sessionExpired, login } = useAuth()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/session/orders'

  if (status === 'loading') {
    return (
      <p role="status" className="py-6 text-center text-gray-500">
        Restoring your session...
      </p>
    )
  }
  if (status === 'authenticated') return <Navigate to={from} replace />

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    try {
      await login(values.username, values.password)
    } catch (error) {
      setServerError(
        error instanceof ApiError && error.status === 401
          ? error.message
          : 'Could not reach the server. Please try again.',
      )
    }
  }

  return (
    <div className="space-y-4">
      <h3>Sign in</h3>
      {sessionExpired && (
        <p role="status" className="rounded-md bg-primary-light p-3 text-sm">
          Your session expired. Please sign in again.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Username" htmlFor="username" error={errors.username?.message}>
          <input
            id="username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
            className={INPUT_CLASS}
            {...register('username')}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={INPUT_CLASS}
            {...register('password')}
          />
        </Field>
        {serverError && (
          <p role="alert" className="text-sm text-error">
            {serverError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="text-sm text-gray-600">
        Demo accounts: <code>user</code> / <code>user123</code> and <code>admin</code> /{' '}
        <code>admin123</code>
      </p>
    </div>
  )
}
