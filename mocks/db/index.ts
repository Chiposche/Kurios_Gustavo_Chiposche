import type { NFT } from '../../src/api/types/nft.types'
import type { CartItem } from '../../src/api/types/cart.types'
import type { Order } from '../../src/api/types/order.types'
import type { Profile } from '../../src/api/types/profile.types'
import type { Wallet } from '../../src/api/types/wallet.types'
import { nftFixtures } from '../fixtures/nft-fixtures'
import { userFixtures, type MockUser } from '../fixtures/user-fixtures'
import { walletFixtures } from '../fixtures/wallet-fixtures'

const STORAGE_KEY = 'kurio_mock_db'
const DB_VERSION = 3

export interface MockDB {
  users: MockUser[]
  sessions: Map<string, { userId: string; expiresAt: number }>
  nfts: NFT[]
  favorites: Map<string, Set<string>>
  carts: Map<string, CartItem[]>
  orders: Map<string, Order>
  profiles: Map<string, Profile>
  wallets: Map<string, Wallet[]>
  idempotencyKeys: Map<string, { orderId: string; bodyHash: string }>
  coupons: Map<string, { discount: string; expired: boolean }>
}

function createFreshDB(): MockDB {
  const profiles = new Map<string, Profile>()
  userFixtures.forEach((u) => {
    profiles.set(u.id, {
      displayName: u.displayName,
      username: u.username,
      email: u.email,
      ensName: u.ensName,
      walletNickname: u.walletNickname,
      avatar: u.avatar,
    })
  })

  const wallets = new Map<string, Wallet[]>()
  Object.entries(walletFixtures).forEach(([userId, w]) => {
    wallets.set(userId, [...w])
  })

  return {
    users: userFixtures.map((u) => ({ ...u })),
    sessions: new Map(),
    nfts: nftFixtures.map((n) => ({ ...n, editions: n.editions.map((e) => ({ ...e })) })),
    favorites: new Map(),
    carts: new Map(),
    orders: new Map(),
    profiles,
    wallets,
    idempotencyKeys: new Map(),
    coupons: new Map([
      ['KURIO10', { discount: '0.10', expired: false }],
      ['LAUNCH20', { discount: '0.20', expired: false }],
      ['EXPIRED01', { discount: '0.15', expired: true }],
    ]),
  }
}

let db: MockDB = createFreshDB()

export function getDB(): MockDB {
  return db
}

export function resetDB(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
  db = createFreshDB()
}

export function persistDB(): void {
  try {
    const serializable = {
      _version: DB_VERSION,
      sessions: Array.from(db.sessions.entries()),
      favorites: Array.from(db.favorites.entries()).map(([k, v]) => [k, Array.from(v)]),
      carts: Array.from(db.carts.entries()),
      orders: Array.from(db.orders.entries()),
      idempotencyKeys: Array.from(db.idempotencyKeys.entries()),
      nfts: db.nfts,
      profiles: Array.from(db.profiles.entries()),
      wallets: Array.from(db.wallets.entries()),
      users: db.users,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {}
}

export function restoreDB(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)

    if (data._version !== DB_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return false
    }

    db.sessions = new Map(data.sessions)
    db.favorites = new Map(
      (data.favorites as [string, string[]][]).map(([k, v]) => [k, new Set(v)])
    )
    db.carts = new Map(data.carts)
    db.orders = new Map(data.orders)
    db.idempotencyKeys = new Map(data.idempotencyKeys)
    db.nfts = data.nfts
    db.profiles = new Map(data.profiles)
    db.wallets = new Map(data.wallets)
    db.users = data.users
    return true
  } catch {
    return false
  }
}

restoreDB()
