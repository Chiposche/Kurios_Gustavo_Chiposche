import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { Layout } from '../components/layout/Layout'
import { HomePage } from '../pages/HomePage'
import { MarketplacePage } from '../pages/MarketplacePage'
import { NftDetailPage } from '../pages/NftDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProfilePage } from '../pages/ProfilePage'
import { WalletsPage } from '../pages/WalletsPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { CreatorsPage } from '../pages/CreatorsPage'
import { LearnPage } from '../pages/LearnPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import type { NFTFilters } from '../api/types/nft.types'

// Rotas do app
const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Filtros na URL pra sobreviver refresh
const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  validateSearch: (search: Record<string, unknown>): NFTFilters => {
    const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : undefined)
    const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
      typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined

    const page = Number(search.page)
    const parsed: NFTFilters = {
      search: str(search.search),
      category: str(search.category),
      network: str(search.network),
      maxPrice: str(search.maxPrice),
      tab: oneOf(search.tab, ['all', 'new', 'trending'] as const),
      sort: oneOf(search.sort, ['recent', 'price_asc', 'price_desc', 'name'] as const),
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    }

    // Remove chaves vazias para manter a URL limpa
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value !== undefined),
    ) as NFTFilters
  },
  component: MarketplacePage,
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: NftDetailPage,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
})

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderConfirmationPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallets',
  component: WalletsPage,
})

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
})

const creatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/criadores',
  component: CreatorsPage,
})

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aprenda',
  component: LearnPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  marketplaceRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
  favoritesRoute,
  creatorsRoute,
  learnRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
