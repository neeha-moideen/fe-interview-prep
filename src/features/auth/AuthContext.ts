import { createContext } from 'react'
import type { User } from './schemas'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status: AuthStatus
  user: User | null
  sessionExpired: boolean
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
