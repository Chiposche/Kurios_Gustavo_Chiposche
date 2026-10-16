import { api } from '../client'
import type { LoginRequest, LoginResponse, RegisterRequest, SessionResponse } from '../types/auth.types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<LoginResponse>('/auth/register', data).then((r) => r.data),

  getSession: () =>
    api.get<SessionResponse>('/auth/session').then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
}
