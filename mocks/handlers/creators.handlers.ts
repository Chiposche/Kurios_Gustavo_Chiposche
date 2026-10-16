import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { creatorFixtures } from '../fixtures/creator-fixtures'

// Handlers para a API de criadores
export const creatorsHandlers = [
  // Lista todos os criadores com paginação
  http.get('/api/creators', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('perPage')) || 6

    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedItems = creatorFixtures.slice(start, end)

    return HttpResponse.json({
      data: paginatedItems,
      meta: {
        page,
        perPage,
        total: creatorFixtures.length,
        totalPages: Math.ceil(creatorFixtures.length / perPage),
      },
    })
  }),

  // Busca um criador pelo ID
  http.get('/api/creators/:id', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)

    const creator = creatorFixtures.find((c) => c.id === params.id)
    if (!creator) {
      return HttpResponse.json(
        { message: 'Criador não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: creator })
  }),
]
