import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'
import { getUserFromToken } from './auth.handlers'

export const walletsHandlers = [
  http.get('/api/wallets', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const wallets = db.wallets.get(user.id) ?? []
    return HttpResponse.json({ data: wallets })
  }),

  http.post('/api/wallets', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(300)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as Record<string, string>
    const db = getDB()

    if (!db.wallets.has(user.id)) db.wallets.set(user.id, [])
    const wallets = db.wallets.get(user.id)!

    const wallet = {
      id: `wallet-${crypto.randomUUID().slice(0, 8)}`,
      ...body,
    }
    wallets.push(wallet as any)
    persistDB()
    return HttpResponse.json({ data: wallet }, { status: 201 })
  }),

  http.put('/api/wallets/:id', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(300)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as Record<string, string>
    const db = getDB()
    const wallets = db.wallets.get(user.id) ?? []
    const wallet = wallets.find((w) => w.id === params.id)
    if (!wallet) return HttpResponse.json({ message: 'Carteira não encontrada', code: 'NOT_FOUND' }, { status: 404 })

    Object.assign(wallet, body)
    persistDB()
    return HttpResponse.json({ data: wallet })
  }),
]
