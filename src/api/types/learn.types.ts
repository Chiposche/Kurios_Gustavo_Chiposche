export type ArticleCategory = 'guia' | 'tutorial' | 'conceito' | 'novidade'

export interface Article {
  id: string
  title: string
  description: string
  category: ArticleCategory
  image: string
  readTime: number
  author: string
  createdAt: string
  slug: string
}
