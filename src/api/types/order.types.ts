export interface OrderItem {
  nftId: string
  name: string
  image: string
  tokenId: string
  editionId: string
  editionLabel: string
  price: string
  quantity: number
  subtotal: string
}

export interface Order {
  id: string
  transactionId: string
  status: 'pending' | 'confirmed' | 'declined'
  items: OrderItem[]
  networkFee: string
  total: string
  wallet: string
  network: string
  date: string
  version: number
}

export interface CreateOrderRequest {
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
