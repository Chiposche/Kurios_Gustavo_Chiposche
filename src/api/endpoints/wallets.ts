import { api } from '../client'
import type { Wallet, CreateWalletRequest, UpdateWalletRequest } from '../types/wallet.types'
import type { ApiResponse } from '../types/common.types'

export const walletsApi = {
  list: () =>
    api.get<ApiResponse<Wallet[]>>('/wallets').then((r) => r.data),

  create: (data: CreateWalletRequest) =>
    api.post<ApiResponse<Wallet>>('/wallets', data).then((r) => r.data),

  update: (id: string, data: UpdateWalletRequest) =>
    api.put<ApiResponse<Wallet>>(`/wallets/${id}`, data).then((r) => r.data),
}
