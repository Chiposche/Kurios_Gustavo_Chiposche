import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { learnApi } from '../api/endpoints/learn'
import type { ArticleCategory } from '../api/types/learn.types'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { BookOpen, Clock } from 'lucide-react'

const categoryLabels: Record<ArticleCategory, string> = {
  guia: 'Guia',
  tutorial: 'Tutorial',
  conceito: 'Conceito',
  novidade: 'Novidade',
}

// Página Aprenda - artigos educativos sobre NFTs
export function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['articles', selectedCategory],
    queryFn: () => learnApi.list(selectedCategory ? { category: selectedCategory } : undefined),
  })

  const articles = data?.data ?? []

  const categories: ArticleCategory[] = ['guia', 'tutorial', 'conceito', 'novidade']

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header da página */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-mono text-white mb-2">Aprenda</h1>
        <p className="text-[#A78B6E] text-sm md:text-base">
          Artigos e tutoriais para entender o mundo dos NFTs e blockchain.
        </p>
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded text-sm transition-colors ${
            !selectedCategory
              ? 'bg-[#D4944C] text-black font-bold'
              : 'bg-[#2A1F1A] text-[#A78B6E] hover:text-white'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              selectedCategory === cat
                ? 'bg-[#D4944C] text-black font-bold'
                : 'bg-[#2A1F1A] text-[#A78B6E] hover:text-white'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      )}

      {/* Grid de artigos */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="p-0 overflow-hidden">
              {/* Imagem do artigo */}
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/400x240/2A1F1A/D4944C?text=KURIO'
                }}
              />
              <CardContent className="p-5">
                {/* Categoria e tempo de leitura */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{categoryLabels[article.category]}</Badge>
                  <div className="flex items-center gap-1 text-[#A78B6E] text-xs">
                    <Clock size={12} />
                    <span>{article.readTime} min</span>
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {article.title}
                </h2>

                {/* Descrição */}
                <p className="text-[#A78B6E] text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>

                {/* Autor e data */}
                <div className="flex items-center justify-between text-xs text-[#A78B6E] pt-3 border-t border-[#3A2A20]">
                  <span>Por {article.author}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && articles.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto text-[#3A2A20] mb-4" />
          <p className="text-[#A78B6E]">Nenhum artigo encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  )
}
