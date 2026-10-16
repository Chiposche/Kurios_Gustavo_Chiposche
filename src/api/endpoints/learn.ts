import { api } from '../client'
import type { Article, ArticleCategory } from '../types/learn.types'
import type { PaginatedResponse, ApiResponse } from '../types/common.types'

// Endpoints para buscar artigos educativos
export const learnApi = {
  list: (params?: { category?: ArticleCategory; page?: number; perPage?: number }) =>
    api.get<PaginatedResponse<Article>>('/articles', { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Article>>(`/articles/${slug}`).then((r) => r.data),
}
