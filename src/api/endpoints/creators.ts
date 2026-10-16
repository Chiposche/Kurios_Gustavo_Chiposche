import { api } from '../client'
import type { Creator } from '../types/creator.types'
import type { PaginatedResponse, ApiResponse } from '../types/common.types'

// Endpoints para buscar criadores
export const creatorsApi = {
  list: (params?: { page?: number; perPage?: number }) =>
    api.get<PaginatedResponse<Creator>>('/creators', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Creator>>(`/creators/${id}`).then((r) => r.data),
}
