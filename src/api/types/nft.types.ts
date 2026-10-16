export interface NFT {
  id: string
  name: string
  description: string
  image: string
  images: string[]
  price: string
  originalPrice?: string
  collection: string
  category: string
  network: 'ethereum' | 'polygon' | 'solana'
  tokenId: string
  contractAddress: string
  attributes: string[]
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  editions: Edition[]
  rating: number
  reviewCount: number
  creatorRoyalty: string
  isFavorite?: boolean
  version: number
}

export interface Edition {
  id: string
  label: string
  total: number
  available: number
  type: 'open' | 'limited'
}

export interface NFTFilters {
  search?: string
  category?: string
  network?: string
  minPrice?: string
  maxPrice?: string
  tab?: 'all' | 'new' | 'trending'
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'name'
  page?: number
  perPage?: number
}
