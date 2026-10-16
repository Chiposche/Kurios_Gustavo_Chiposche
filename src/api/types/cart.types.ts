export interface CartItem {
  id: string
  nftId: string
  name: string
  image: string
  tokenId: string
  editionId: string
  editionLabel: string
  price: string
  quantity: number
  maxQuantity: number
  total: string
}

export interface Cart {
  items: CartItem[]
  itemCount: number
}

export interface AddToCartRequest {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface QuoteRequest {
  couponCode?: string
}

export interface Quote {
  items: CartItem[]
  subtotal: string
  discount: string
  couponCode?: string
  networkFee: string
  total: string
  validUntil: number
  version: number
}
