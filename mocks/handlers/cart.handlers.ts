import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'
import { getUserFromToken } from './auth.handlers'
import type { CartItem } from '../../src/api/types/cart.types'
import Decimal from 'decimal.js-light'

function getCartKey(request: Request): string | null {
  const user = getUserFromToken(request.headers.get('Authorization'))
  return user?.id ?? null
}

function buildCartItem(nftId: string, editionId: string, quantity: number): CartItem | null {
  const db = getDB()
  const nft = db.nfts.find((n) => n.id === nftId)
  if (!nft) return null
  const edition = nft.editions.find((e) => e.id === editionId)
  if (!edition) return null

  const maxQty = edition.type === 'open' ? 999 : edition.available
  const qty = Math.min(quantity, maxQty)
  if (qty <= 0) return null

  return {
    id: `cart-${nftId}-${editionId}`,
    nftId,
    name: nft.name,
    image: nft.image,
    tokenId: nft.tokenId,
    editionId,
    editionLabel: edition.label,
    price: nft.price,
    quantity: qty,
    maxQuantity: maxQty,
    total: new Decimal(nft.price).times(qty).toFixed(),
  }
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const userId = getCartKey(request)
    if (!userId) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const stored = db.carts.get(userId) ?? []
    // Reflete o preço atual do NFT (pode ter mudado em tempo real via socket)
    const items = stored.map((item) => {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      if (!nft || nft.price === item.price) return item
      return {
        ...item,
        price: nft.price,
        total: new Decimal(nft.price).times(item.quantity).toFixed(),
      }
    })
    return HttpResponse.json({ data: { items, itemCount: items.reduce((s, i) => s + i.quantity, 0) } })
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)
    const userId = getCartKey(request)
    if (!userId) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as { nftId: string; editionId: string; quantity: number }
    const db = getDB()

    if (!db.carts.has(userId)) db.carts.set(userId, [])
    const cart = db.carts.get(userId)!

    const existing = cart.find((i) => i.nftId === body.nftId && i.editionId === body.editionId)
    if (existing) {
      const newQty = existing.quantity + body.quantity
      const updated = buildCartItem(body.nftId, body.editionId, newQty)
      if (!updated) return HttpResponse.json({ message: 'NFT ou edição não encontrado', code: 'NOT_FOUND' }, { status: 404 })
      Object.assign(existing, updated)
    } else {
      const item = buildCartItem(body.nftId, body.editionId, body.quantity)
      if (!item) return HttpResponse.json({ message: 'NFT ou edição não encontrado', code: 'NOT_FOUND' }, { status: 404 })
      cart.push(item)
    }

    persistDB()
    return HttpResponse.json({ data: { items: cart, itemCount: cart.reduce((s, i) => s + i.quantity, 0) } })
  }),

  http.put('/api/cart/items/:itemId', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const userId = getCartKey(request)
    if (!userId) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as { quantity: number }
    const db = getDB()
    const cart = db.carts.get(userId) ?? []
    const item = cart.find((i) => i.id === params.itemId)
    if (!item) return HttpResponse.json({ message: 'Item não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    const updated = buildCartItem(item.nftId, item.editionId, body.quantity)
    if (!updated) return HttpResponse.json({ message: 'Quantidade inválida', code: 'INVALID_QUANTITY' }, { status: 422 })

    Object.assign(item, updated)
    persistDB()
    return HttpResponse.json({ data: { items: cart, itemCount: cart.reduce((s, i) => s + i.quantity, 0) } })
  }),

  http.delete('/api/cart/items/:itemId', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const userId = getCartKey(request)
    if (!userId) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const cart = db.carts.get(userId) ?? []
    const idx = cart.findIndex((i) => i.id === params.itemId)
    if (idx === -1) return HttpResponse.json({ message: 'Item não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    cart.splice(idx, 1)
    persistDB()
    return HttpResponse.json({ data: { items: cart, itemCount: cart.reduce((s, i) => s + i.quantity, 0) } })
  }),

  http.post('/api/cart/quote', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)
    const userId = getCartKey(request)
    if (!userId) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    // Corpo opcional: sem cupom o cliente envia POST vazio
    let body: { couponCode?: string } | null = null
    try {
      body = (await request.json()) as { couponCode?: string } | null
    } catch {
      body = null
    }
    const db = getDB()
    const cart = db.carts.get(userId) ?? []

    if (cart.length === 0) {
      return HttpResponse.json({ message: 'Carrinho vazio', code: 'EMPTY_CART' }, { status: 422 })
    }

    const refreshedItems = cart.map((item) => {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      if (!nft) return item
      return {
        ...item,
        price: nft.price,
        total: new Decimal(nft.price).times(item.quantity).toFixed(),
      }
    })

    let subtotal = refreshedItems.reduce((s, i) => s.plus(i.total), new Decimal(0))
    let discount = new Decimal(0)
    let couponCode = body?.couponCode

    if (couponCode) {
      const coupon = db.coupons.get(couponCode)
      if (!coupon) {
        return HttpResponse.json({ message: 'Cupom inválido', code: 'INVALID_COUPON' }, { status: 422 })
      }
      if (coupon.expired) {
        return HttpResponse.json({ message: 'Cupom expirado', code: 'EXPIRED_COUPON' }, { status: 422 })
      }
      discount = subtotal.times(coupon.discount)
    }

    const networkFee = new Decimal('0.016')
    const total = subtotal.minus(discount).plus(networkFee)

    return HttpResponse.json({
      data: {
        items: refreshedItems,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        couponCode: couponCode || undefined,
        networkFee: networkFee.toFixed(3),
        total: total.toFixed(3),
        validUntil: Date.now() + 5 * 60 * 1000,
        version: Date.now(),
      },
    })
  }),
]
