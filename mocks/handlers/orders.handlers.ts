import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'
import { getUserFromToken } from './auth.handlers'
import { emitOrderUpdated } from '../socket'
import type { Order } from '../../src/api/types/order.types'
import Decimal from 'decimal.js-light'

export const ordersHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(500)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) {
      return HttpResponse.json({ message: 'Idempotency-Key obrigatório', code: 'MISSING_IDEMPOTENCY_KEY' }, { status: 400 })
    }

    const body = (await request.json()) as {
      walletId: string
      network: string
      couponCode?: string
      collectorName: string
      collectorUsername: string
      collectorEmail: string
      walletAddress: string
      walletType: string
      ensName?: string
      referralCode?: string
      notes?: string
    }

    const db = getDB()

    // Verifica idempotência: mesma key retorna o mesmo pedido,
    // key reutilizada com conteúdo diferente gera conflito 409
    const bodyHash = JSON.stringify(body)
    const existing = db.idempotencyKeys.get(idempotencyKey)
    if (existing) {
      if (existing.bodyHash !== bodyHash) {
        return HttpResponse.json(
          { message: 'Idempotency-Key já usada com conteúdo diferente', code: 'CONFLICT' },
          { status: 409 }
        )
      }
      const existingOrder = db.orders.get(existing.orderId)
      if (existingOrder) {
        return HttpResponse.json({ data: existingOrder })
      }
    }

    const cart = db.carts.get(user.id) ?? []
    if (cart.length === 0) {
      return HttpResponse.json({ message: 'Carrinho vazio', code: 'EMPTY_CART' }, { status: 422 })
    }

    const items = cart.map((item) => {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      const price = nft?.price ?? item.price
      return {
        nftId: item.nftId,
        name: item.name,
        image: item.image,
        tokenId: item.tokenId,
        editionId: item.editionId,
        editionLabel: item.editionLabel,
        price,
        quantity: item.quantity,
        subtotal: new Decimal(price).times(item.quantity).toFixed(),
      }
    })

    const subtotal = items.reduce((s, i) => s.plus(i.subtotal), new Decimal(0))
    const networkFee = new Decimal('0.016')
    const total = subtotal.plus(networkFee)

    const txId = `0xA91F_E82C_${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    const order: Order = {
      id: `order-${crypto.randomUUID().slice(0, 8)}`,
      transactionId: txId,
      status: 'pending',
      items,
      networkFee: networkFee.toFixed(3),
      total: total.toFixed(3),
      wallet: body.walletType,
      network: body.network,
      date: new Date().toISOString(),
      version: 1,
    }

    db.orders.set(order.id, order)
    db.idempotencyKeys.set(idempotencyKey, { orderId: order.id, bodyHash })
    persistDB()

    // Carteira de teste simulada: recusa o pagamento para exercitar o cenário de falha
    const willBeDeclined = body.walletId === 'test-declined'

    setTimeout(() => {
      const currentOrder = db.orders.get(order.id)
      if (currentOrder && currentOrder.status === 'pending') {
        if (willBeDeclined) {
          // Pagamento recusado: pedido fica terminal, carrinho é preservado
          currentOrder.status = 'declined'
          currentOrder.version = 2
        } else {
          currentOrder.status = 'confirmed'
          currentOrder.version = 2
          db.carts.set(user.id, [])
        }
        persistDB()
        // Notifica clientes em tempo real via Socket.IO
        emitOrderUpdated(currentOrder.id, currentOrder.status, currentOrder.version)
      }
    }, 2000)

    return HttpResponse.json({ data: order }, { status: 201 })
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const order = db.orders.get(params.id as string)
    if (!order) {
      return HttpResponse.json({ message: 'Pedido não encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    return HttpResponse.json({ data: order })
  }),
]
