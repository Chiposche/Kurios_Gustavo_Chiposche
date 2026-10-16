import { http, HttpResponse } from 'msw'
import { changeNftPrice } from '../scenarios'
import { emitNftUpdated } from '../socket'

// Cenário de preço alterado durante a compra
export const scenarioHandlers = [
  http.post('/api/__scenario/price-change', async ({ request }) => {
    let nftId: string | undefined
    try {
      const body = (await request.json()) as { nftId?: string } | null
      nftId = body?.nftId
    } catch {
      nftId = undefined
    }

    const change = changeNftPrice(nftId)
    if (!change) {
      return HttpResponse.json({ message: 'Nenhum NFT disponível', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Notifica os clientes conectados pelo Socket.IO
    emitNftUpdated(change.nftId, change.version)
    return HttpResponse.json({ data: change })
  }),
]
