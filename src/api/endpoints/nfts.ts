import { api } from '../client'
import type { NFT, NFTFilters } from '../types/nft.types'
import type { PaginatedResponse, ApiResponse } from '../types/common.types'

export const nftsApi = {
  list: (filters: NFTFilters) =>
    api.get<PaginatedResponse<NFT>>('/nfts', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<NFT>>(`/nfts/${id}`).then((r) => r.data),
}
