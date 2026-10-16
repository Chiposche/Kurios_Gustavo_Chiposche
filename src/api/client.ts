import axios from 'axios'
import { getNetworkMode } from '../lib/network'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Network-Mode'] = getNetworkMode()
  return config
})

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

api.interceptors.response.use(
  (response) => {
    // Sem a camada de mocks (VITE_ENABLE_MSW ausente), o rewrite SPA do deploy
    // devolve index.html com status 200. Rejeitar aqui faz a UI mostrar o
    // estado de erro com "Recarregar" em vez de uma lista vazia silenciosa.
    if (typeof response.data === 'string' && response.data.trimStart().startsWith('<')) {
      console.error(
        '[API] A API respondeu HTML em vez de JSON — a camada de mocks (VITE_ENABLE_MSW) parece desligada neste build.',
      )
      return Promise.reject(new Error('Resposta inesperada da API (HTML em vez de JSON)'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth_token')
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)
