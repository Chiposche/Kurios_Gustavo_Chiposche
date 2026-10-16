import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/endpoints/auth'
import type { User, LoginRequest, RegisterRequest } from '../api/types/auth.types'

// Contexto de autenticação - compartilha o estado do usuário com toda a app
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // Verifica sessão ativa
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const user = session?.user ?? null
  const isAuthenticated = !!user

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      sessionStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['session'], { user: data.user, expiresAt: data.expiresAt })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      sessionStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['session'], { user: data.user, expiresAt: data.expiresAt })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      sessionStorage.removeItem('auth_token')
      // Limpa o cache pra não vazar dados entre usuários
      queryClient.clear()
    },
  })

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data)
  }

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
