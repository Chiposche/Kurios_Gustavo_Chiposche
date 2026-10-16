import { useQuery } from '@tanstack/react-query'
import { creatorsApi } from '../api/endpoints/creators'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Users, Image, ShoppingBag, BadgeCheck } from 'lucide-react'

// Página de Criadores - mostra os artistas do marketplace
export function CreatorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: () => creatorsApi.list(),
  })

  const creators = data?.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header da página */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-mono text-white mb-2">Criadores</h1>
        <p className="text-[#A78B6E] text-sm md:text-base">
          Conheça os artistas e criadores que fazem parte do marketplace KURIO.
        </p>
      </div>

      {/* Loading state com skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {/* Grid de criadores */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Card key={creator.id} className="p-0 overflow-hidden">
              <CardContent className="p-6">
                {/* Avatar e nome */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#3A2A20]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/120x120/2A1F1A/D4944C?text=?'
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white font-bold text-lg">{creator.name}</h2>
                      {creator.verified && (
                        <BadgeCheck size={18} className="text-[#D4944C]" />
                      )}
                    </div>
                    {creator.verified && (
                      <Badge variant="primary" className="mt-1">Verificado</Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[#A78B6E] text-sm mb-4 line-clamp-2">
                  {creator.bio}
                </p>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#3A2A20]">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#D4944C] mb-1">
                      <Image size={14} />
                      <span className="font-mono font-bold text-sm">{creator.totalNfts}</span>
                    </div>
                    <span className="text-[#A78B6E] text-xs">NFTs</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#D4944C] mb-1">
                      <ShoppingBag size={14} />
                      <span className="font-mono font-bold text-sm">{creator.totalSales}</span>
                    </div>
                    <span className="text-[#A78B6E] text-xs">Vendas</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#D4944C] mb-1">
                      <Users size={14} />
                      <span className="font-mono font-bold text-sm">{creator.followers}</span>
                    </div>
                    <span className="text-[#A78B6E] text-xs">Seguidores</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && creators.length === 0 && (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-[#3A2A20] mb-4" />
          <p className="text-[#A78B6E]">Nenhum criador encontrado.</p>
        </div>
      )}
    </div>
  )
}
