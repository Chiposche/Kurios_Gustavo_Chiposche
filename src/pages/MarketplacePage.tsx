import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { nftsApi } from '../api/endpoints/nfts'
import { cartApi } from '../api/endpoints/cart'
import { favoritesApi } from '../api/endpoints/favorites'
import { useAuth } from '../hooks/useAuth'
import { Heart, ShoppingCart, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import type { NFTFilters, NFT } from '../api/types/nft.types'

const categories = [
  { name: 'Arte digital', count: 33 },
  { name: 'Fotografia', count: 12 },
  { name: 'Música', count: 65 },
  { name: 'Arte 3D', count: 39 },
  { name: 'Colecionáveis', count: 23 },
  { name: 'Generativa', count: 17 },
  { name: 'Jogos', count: 19 },
  { name: 'Assinaturas', count: 13 },
  { name: 'Utilidade', count: 18 },
]

const networks = [
  { name: 'Ethereum', count: 119 },
  { name: 'Polygon', count: 78 },
  { name: 'Solana', count: 86 },
]

const tabs = [
  { key: 'all', label: 'Todos os NFTs' },
  { key: 'new', label: 'Novos lançamentos' },
  { key: 'trending', label: 'Em alta' },
]

// Página do Marketplace - catálogo de NFTs com filtros e paginação
export function MarketplacePage() {
  // Filtros vêm da URL
  const routeSearch = useSearch({ from: '/marketplace' })

  // Padrões + o que está na URL
  const filters: NFTFilters = {
    tab: 'all',
    sort: 'recent',
    page: 1,
    perPage: 9,
    ...routeSearch,
  }

  // Rascunho local, vai pra URL ao clicar "Aplicar"
  const [priceRange, setPriceRange] = useState([0.02, filters.maxPrice ? parseFloat(filters.maxPrice) : 12.38])

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [poppedFavoriteId, setPoppedFavoriteId] = useState<string | null>(null)

  const catalogRef = useRef<HTMLElement>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['nfts', filters],
    queryFn: () => nftsApi.list(filters),
  })

  const nfts = data?.data ?? []
  const meta = data?.meta

  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  })
  const favoriteIds = favoritesData?.data ?? []

  const addToCartMutation = useMutation({
    mutationFn: (nft: NFT) => {
      const edition = nft.editions.find((e) => e.available > 0) ?? nft.editions[0]
      return cartApi.addItem({ nftId: nft.id, editionId: edition.id, quantity: 1 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      alert('NFT adicionado ao carrinho!')
    },
    onError: () => {
      alert('Erro ao adicionar ao carrinho.')
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ nftId, isFavorite }: { nftId: string; isFavorite: boolean }) =>
      isFavorite ? favoritesApi.remove(nftId) : favoritesApi.add(nftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: () => {
      alert('Erro ao atualizar favorito.')
    },
  })

  const handleAddToCart = (nft: NFT) => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    addToCartMutation.mutate(nft)
  }

  const handleToggleFavorite = (nftId: string, isFavorite: boolean) => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    setPoppedFavoriteId(nftId)
    window.setTimeout(() => {
      setPoppedFavoriteId((current) => (current === nftId ? null : current))
    }, 400)
    toggleFavoriteMutation.mutate({ nftId, isFavorite })
  }

  // Atualiza filtro na URL
  const updateFilter = (key: keyof NFTFilters, value: string | number | undefined) => {
    const next: NFTFilters = { ...filters, [key]: value }

    if (key !== 'page') next.page = 1

    const search: NFTFilters = {}
    if (next.search) search.search = next.search
    if (next.category) search.category = next.category
    if (next.network) search.network = next.network
    if (next.maxPrice) search.maxPrice = next.maxPrice
    if (next.tab && next.tab !== 'all') search.tab = next.tab
    if (next.sort && next.sort !== 'recent') search.sort = next.sort
    if (next.page && next.page > 1) search.page = next.page

    // Na busca, replace pra não acumular no histórico
    navigate({ to: '/marketplace', search, replace: key === 'search' })

    if (key === 'page') {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Cabeçalho do marketplace */}
      <section className="px-4 md:px-8 pt-8 pb-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-[#A78B6E] text-sm">Explore, filtre e colecione NFTs únicos de criadores verificados.</p>
        </div>
      </section>

      {/* Catálogo */}
      <section ref={catalogRef} className="px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Sidebar de filtros - só aparece no desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            {/* Filtro por coleção/categoria */}
            <h3 className="text-white font-bold mb-3">Coleções</h3>
            <ul className="space-y-2 mb-8">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => updateFilter('category', filters.category === cat.name ? undefined : cat.name)}
                    className={`flex justify-between w-full text-sm py-1 transition-colors ${
                      filters.category === cat.name
                        ? 'text-[#D4944C]'
                        : 'text-[#C4956A] hover:text-[#D4944C]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[#A78B6E]">({cat.count})</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Faixa de preço */}
            <h3 className="text-white font-bold mb-3">Faixa de preço</h3>
            <div className="mb-8">
              <input
                type="range"
                min="0.02"
                max="12.38"
                step="0.01"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                className="w-full accent-[#D4944C]"
              />
              <div className="flex justify-between text-[#A78B6E] text-xs mt-1">
                <span>Preço: {priceRange[0].toFixed(2)}</span>
                <span>– {priceRange[1].toFixed(2)} ETH</span>
              </div>
              <button
                onClick={() => updateFilter('maxPrice', priceRange[1].toString())}
                className="mt-2 border border-[#D4944C] text-[#D4944C] px-4 py-1 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
              >
                Aplicar
              </button>
            </div>

            {/* Filtro por rede */}
            <h3 className="text-white font-bold mb-3">Rede</h3>
            <ul className="space-y-2">
              {networks.map((net) => (
                <li key={net.name}>
                  <button
                    onClick={() => updateFilter('network', filters.network === net.name.toLowerCase() ? undefined : net.name.toLowerCase())}
                    className={`flex justify-between w-full text-sm py-1 transition-colors ${
                      filters.network === net.name.toLowerCase()
                        ? 'text-[#D4944C]'
                        : 'text-[#C4956A] hover:text-[#D4944C]'
                    }`}
                  >
                    <span>{net.name}</span>
                    <span className="text-[#A78B6E]">({net.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Conteúdo principal */}
          <div className="flex-1">
            {/* Tabs e ordenação */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-3 md:gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => updateFilter('tab', tab.key)}
                    className={`text-sm pb-2 border-b-2 transition-colors ${
                      filters.tab === tab.key
                        ? 'text-white border-[#D4944C]'
                        : 'text-[#A78B6E] border-transparent hover:text-[#C4956A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-[#2A1F1A] border border-[#3A2A20] rounded px-3 py-1.5 text-[#C4956A] text-sm focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
              >
                <option value="recent">Listados recentemente</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>

            {/* Botão de filtros mobile */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 text-[#D4944C] border border-[#3A2A20] rounded-full px-4 py-2 text-sm mb-4"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            {/* Barra de busca mobile */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A78B6E]" />
                <input
                  type="text"
                  placeholder="Explorar coleções"
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value || undefined)}
                  className="w-full bg-[#2A1F1A] border border-[#3A2A20] rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                />
              </div>
            </div>

            {/* Grid de NFTs */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-[#C4956A]">Erro ao carregar NFTs. Tente novamente.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[#D4944C] underline"
                >
                  Recarregar
                </button>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#C4956A]">Nenhum NFT encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {nfts.map((nft, index) => (
                  <Link
                    key={nft.id}
                    to="/nft/$nftId"
                    params={{ nftId: nft.id }}
                    className="group animate-card-in bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/40 transition-all"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/400x400/2A1F1A/D4944C?text=${encodeURIComponent(nft.name.slice(0, 10))}`
                        }}
                      />
                      {nft.rarity === 'rare' && (
                        <Badge variant="rare" className="absolute top-3 right-3">RARO</Badge>
                      )}
                      {nft.rarity === 'legendary' && (
                        <Badge variant="legendary" className="absolute top-3 right-3">LENDÁRIO</Badge>
                      )}
                      {nft.rarity === 'epic' && (
                        <Badge variant="epic" className="absolute top-3 right-3">ÉPICO</Badge>
                      )}
                      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAddToCart(nft)
                          }}
                          disabled={addToCartMutation.isPending}
                          className="bg-[#1A1412]/80 text-white p-2 rounded-full hover:bg-[#D4944C] hover:text-black transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                          aria-label="Adicionar ao carrinho"
                        >
                          <ShoppingCart size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleFavorite(nft.id, favoriteIds.includes(nft.id))
                          }}
                          className={`bg-[#1A1412]/80 text-white p-2 rounded-full hover:bg-[#D4944C] hover:text-black transition-all hover:scale-110 active:scale-95 ${
                            poppedFavoriteId === nft.id ? 'heart-pop' : ''
                          }`}
                          aria-label={favoriteIds.includes(nft.id) ? 'Remover dos favoritos' : 'Favoritar'}
                        >
                          <Heart
                            size={16}
                            className={favoriteIds.includes(nft.id) ? 'fill-[#D4944C] text-[#D4944C]' : ''}
                          />
                        </button>
                        <span className="bg-[#1A1412]/80 text-white p-2 rounded-full" aria-label="Ver detalhes">
                          <Search size={16} />
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleToggleFavorite(nft.id, favoriteIds.includes(nft.id))
                        }}
                        className={`md:hidden absolute top-3 right-3 bg-[#2A1F1A]/80 p-2 rounded-full transition-all active:scale-95 ${
                          poppedFavoriteId === nft.id ? 'heart-pop' : ''
                        }`}
                        aria-label={favoriteIds.includes(nft.id) ? 'Remover dos favoritos' : 'Favoritar'}
                      >
                        <Heart
                          size={16}
                          className={favoriteIds.includes(nft.id) ? 'fill-[#D4944C] text-[#D4944C]' : 'text-white'}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium truncate">{nft.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#D4944C] font-mono text-sm group-hover:text-[#E0A55D] transition-colors">
                          {nft.price} ETH
                        </span>
                        {nft.originalPrice && (
                          <span className="text-[#A78B6E] line-through text-xs">{nft.originalPrice} ETH</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Paginação */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateFilter('page', i + 1)}
                    className={`w-8 h-8 rounded text-sm transition-colors ${
                      filters.page === i + 1
                        ? 'bg-[#D4944C] text-black font-bold'
                        : 'text-[#C4956A] hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {meta.page < meta.totalPages && (
                  <button
                    onClick={() => updateFilter('page', (filters.page || 1) + 1)}
                    className="text-[#C4956A] hover:text-white px-2"
                  >
                    &gt;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Drawer de filtros mobile */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Fundo escuro */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Painel de filtros */}
          <div className="relative bg-[#1A1412] w-72 max-w-[80vw] h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-[#A78B6E] hover:text-white"
                aria-label="Fechar filtros"
              >
                <X size={20} />
              </button>
            </div>

            {/* Coleções */}
            <h3 className="text-white font-bold mb-3">Coleções</h3>
            <ul className="space-y-2 mb-8">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => {
                      updateFilter('category', filters.category === cat.name ? undefined : cat.name)
                    }}
                    className={`flex justify-between w-full text-sm py-1 transition-colors ${
                      filters.category === cat.name
                        ? 'text-[#D4944C]'
                        : 'text-[#C4956A] hover:text-[#D4944C]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[#A78B6E]">({cat.count})</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Faixa de preço */}
            <h3 className="text-white font-bold mb-3">Faixa de preço</h3>
            <div className="mb-8">
              <input
                type="range"
                min="0.02"
                max="12.38"
                step="0.01"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                className="w-full accent-[#D4944C]"
              />
              <div className="flex justify-between text-[#A78B6E] text-xs mt-1">
                <span>Preço: {priceRange[0].toFixed(2)}</span>
                <span>– {priceRange[1].toFixed(2)} ETH</span>
              </div>
              <button
                onClick={() => {
                  updateFilter('maxPrice', priceRange[1].toString())
                  setMobileFiltersOpen(false)
                }}
                className="mt-2 border border-[#D4944C] text-[#D4944C] px-4 py-1 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
              >
                Aplicar
              </button>
            </div>

            {/* Rede */}
            <h3 className="text-white font-bold mb-3">Rede</h3>
            <ul className="space-y-2">
              {networks.map((net) => (
                <li key={net.name}>
                  <button
                    onClick={() => {
                      updateFilter('network', filters.network === net.name.toLowerCase() ? undefined : net.name.toLowerCase())
                    }}
                    className={`flex justify-between w-full text-sm py-1 transition-colors ${
                      filters.network === net.name.toLowerCase()
                        ? 'text-[#D4944C]'
                        : 'text-[#C4956A] hover:text-[#D4944C]'
                    }`}
                  >
                    <span>{net.name}</span>
                    <span className="text-[#A78B6E]">({net.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Seção NFT em Destaque - Oferta Limitada */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="font-mono text-lg font-bold text-white">NFT EM DESTAQUE</h2>
            <p className="text-[#D4944C] text-sm font-mono">OFERTA LIMITADA</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Link
              to="/nft/$nftId"
              params={{ nftId: 'nft-001' }}
              className="col-span-2 md:col-span-1 md:row-span-2 group bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/nfts/emerald-ape.svg"
                  alt="NFT em destaque"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2A1F1A/D4944C?text=NFT'
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium">Emerald Ape #042</h3>
                <span className="text-[#D4944C] font-mono text-sm">1.19 ETH</span>
              </div>
            </Link>

            <Link
              to="/nft/$nftId"
              params={{ nftId: 'nft-007' }}
              className="group bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/nfts/golden-beat.svg"
                  alt="Golden Beat #207"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2A1F1A/D4944C?text=NFT'
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium">Golden Beat #207</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[#D4944C] font-mono text-sm">0.99 ETH</span>
                </div>
              </div>
            </Link>

            <Link
              to="/nft/$nftId"
              params={{ nftId: 'nft-008' }}
              className="group bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/nfts/golden-signal.svg"
                  alt="Golden Signal #160"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2A1F1A/D4944C?text=NFT'
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium">Golden Signal #160</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[#D4944C] font-mono text-sm">0.39 ETH</span>
                  <span className="text-[#A78B6E] line-through text-xs">0.59 ETH</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
