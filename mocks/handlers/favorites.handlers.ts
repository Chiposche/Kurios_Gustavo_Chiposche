import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'
import { getUserFromToken } from './auth.handlers'

export const favoritesHandlers = [
  http.get('/api/favorites', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(100)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const favs = db.favorites.get(user.id) ?? new Set()
    return HttpResponse.json({ data: Array.from(favs) })
  }),

  http.post('/api/favorites/:nftId', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    if (!db.favorites.has(user.id)) db.favorites.set(user.id, new Set())
    db.favorites.get(user.id)!.add(params.nftId as string)
    persistDB()

    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/favorites/:nftId', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    db.favorites.get(user.id)?.delete(params.nftId as string)
    persistDB()

    return HttpResponse.json({ success: true })
  }),
]
