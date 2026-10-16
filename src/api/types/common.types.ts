export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  errors?: Record<string, string[]>
}

export interface ApiResponse<T> {
  data: T
}
