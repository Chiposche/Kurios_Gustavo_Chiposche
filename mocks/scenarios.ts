import Decimal from 'decimal.js-light'
import { getDB, persistDB } from './db'

export interface PriceChange {
  nftId: string
  name: string
  oldPrice: string
  newPrice: string
  version: number
}

// Altera o preço de um NFT no banco do mock e incrementa a versão
export function changeNftPrice(nftId?: string): PriceChange | null {
  const db = getDB()

  let nft = nftId ? db.nfts.find((n) => n.id === nftId) : undefined

  // Sem id explícito: prefere um NFT que esteja no carrinho de alguém
  // (assim a demo sem id também exercita o cenário) e cai no primeiro da lista
  if (!nft) {
    const cartedIds = new Set([...db.carts.values()].flat().map((item) => item.nftId))
    nft = db.nfts.find((n) => cartedIds.has(n.id)) ?? db.nfts[0]
  }
  if (!nft) return null

  const oldPrice = nft.price
  const newPrice = new Decimal(oldPrice).times('1.1').toFixed(2)
  nft.price = newPrice
  nft.version += 1
  persistDB()

  return { nftId: nft.id, name: nft.name, oldPrice, newPrice, version: nft.version }
}
