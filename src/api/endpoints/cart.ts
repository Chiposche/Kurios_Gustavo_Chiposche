import { api } from '../client'
import type { Cart, AddToCartRequest, UpdateCartItemRequest, Quote, QuoteRequest } from '../types/cart.types'
import type { ApiResponse } from '../types/common.types'

export const cartApi = {
  get: () =>
    api.get<ApiResponse<Cart>>('/cart').then((r) => r.data),

  addItem: (data: AddToCartRequest) =>
    api.post<ApiResponse<Cart>>('/cart/items', data).then((r) => r.data),

  updateItem: (itemId: string, data: UpdateCartItemRequest) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, data).then((r) => r.data),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`).then((r) => r.data),

  getQuote: (data?: QuoteRequest) =>
    api.post<ApiResponse<Quote>>('/cart/quote', data).then((r) => r.data),
}
