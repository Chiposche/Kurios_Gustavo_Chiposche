import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { articleFixtures } from '../fixtures/learn-fixtures'

// Handlers para a API de artigos educativos
export const learnHandlers = [
  // Lista artigos com filtro por categoria
  http.get('/api/articles', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('perPage')) || 6

    // Filtra por categoria se passada
    let filtered = articleFixtures
    if (category) {
      filtered = articleFixtures.filter((a) => a.category === category)
    }

    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedItems = filtered.slice(start, end)

    return HttpResponse.json({
      data: paginatedItems,
      meta: {
        page,
        perPage,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / perPage),
      },
    })
  }),

  // Busca um artigo pelo slug
  http.get('/api/articles/:slug', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)

    const article = articleFixtures.find((a) => a.slug === params.slug)
    if (!article) {
      return HttpResponse.json(
        { message: 'Artigo não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: article })
  }),
]
