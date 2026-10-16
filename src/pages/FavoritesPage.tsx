import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftsApi } from '../api/endpoints/nfts'
import { favoritesApi } from '../api/endpoints/favorites'
import { useAuth } from '../hooks/useAuth'

// Página de Favoritos - lista os NFTs que o colecionador marcou com coração
export function FavoritesPage() {
  const { isAuthenticated } = useAuth()

  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  })
  const favoriteIds = favoritesData?.data ?? []

  const { data: nftsData, isLoading: nftsLoading } = useQuery({
    queryKey: ['nfts', { perPage: 100 }],
    queryFn: () => nftsApi.list({ perPage: 100 }),
    enabled: isAuthenticated && favoriteIds.length > 0,
  })

  const favoriteNfts = nftsData?.data?.filter((nft) => favoriteIds.includes(nft.id)) ?? []
  const isLoading = favoritesLoading || (favoriteIds.length > 0 && nftsLoading)

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center pb-20 md:pb-0">
        <h1 className="text-2xl font-mono text-white mb-4">Favoritos</h1>
        <p className="text-[#A78B6E] mb-6">Faça login para ver seus NFTs favoritos.</p>
        <Link to="/login" className="bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D]">
          Entrar
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-mono text-white">Favoritos</h1>
        <p className="text-[#A78B6E] text-sm mt-1">
          {favoriteIds.length > 0
            ? `${favoriteIds.length} NFT(s) na sua coleção de interesse`
            : 'Seus NFTs marcados com coração'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer rounded-xl h-64" />
          ))}
        </div>
      ) : favoriteNfts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#C4956A] mb-6">Você ainda não favoritou nenhum NFT.</p>
          <Link
            to="/marketplace"
            className="bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D] inline-block"
          >
            Explorar NFTs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {favoriteNfts.map((nft) => (
            <Link
              key={nft.id}
              to="/nft/$nftId"
              params={{ nftId: nft.id }}
              className="group bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/2A1F1A/D4944C?text=${encodeURIComponent(nft.name.slice(0, 10))}`
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium truncate">{nft.name}</h3>
                <span className="text-[#D4944C] font-mono text-sm">{nft.price} ETH</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
