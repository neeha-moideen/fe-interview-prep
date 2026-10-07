import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setSessionExpiredHandler } from './apiClient'
import { loginRequest, logoutRequest } from './authApi'
import { restoreSession } from './authSession'
import { AuthContext, type AuthState } from './AuthContext'
import { sessionHint } from './sessionHint'
import { tokenStore } from './tokenStore'

const LOADING: AuthState = { status: 'loading', user: null, sessionExpired: false }
const SIGNED_OUT: AuthState = { status: 'unauthenticated', user: null, sessionExpired: false }

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(LOADING)

  useEffect(() => {
    let cancelled = false

    setSessionExpiredHandler(() =>
      setState((current) =>
        current.status === 'authenticated'
          ? { status: 'unauthenticated', user: null, sessionExpired: true }
          : current,
      ),
    )

    restoreSession()
      .then((user) => {
        if (!cancelled) setState({ status: 'authenticated', user, sessionExpired: false })
      })
      .catch(() => {
        if (!cancelled) setState(SIGNED_OUT)
      })

    return () => {
      cancelled = true
      setSessionExpiredHandler(null)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password)
    tokenStore.set(result.accessToken, result.expiresIn)
    sessionHint.set()
    setState({ status: 'authenticated', user: result.user, sessionExpired: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      tokenStore.clear()
      sessionHint.clear()
      setState(SIGNED_OUT)
    }
  }, [])

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
