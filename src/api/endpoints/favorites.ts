import { api } from '../client'

export const favoritesApi = {
  list: () =>
    api.get<{ data: string[] }>('/favorites').then((r) => r.data),

  add: (nftId: string) =>
    api.post(`/favorites/${nftId}`).then((r) => r.data),

  remove: (nftId: string) =>
    api.delete(`/favorites/${nftId}`).then((r) => r.data),
}
