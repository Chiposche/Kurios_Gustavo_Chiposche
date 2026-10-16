export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  walletNickname?: string
  ensName?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: number
}

export interface SessionResponse {
  user: User
  expiresAt: number
}
