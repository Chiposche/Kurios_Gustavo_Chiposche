import { api } from '../client'
import type { Order, CreateOrderRequest } from '../types/order.types'
import type { ApiResponse } from '../types/common.types'

export const ordersApi = {
  create: (data: CreateOrderRequest, idempotencyKey: string) =>
    api.post<ApiResponse<Order>>('/orders', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data),
}
