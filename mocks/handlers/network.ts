import { HttpResponse, delay } from 'msw'

// Aplica a condição de rede simulada
export async function networkGate(request: Request): Promise<Response | null> {
  const mode = request.headers.get('X-Network-Mode') ?? 'normal'

  switch (mode) {
    case 'slow':
      // Lentidão: espera extra antes de responder - mostra os skeletons
      await delay(3000)
      return null
    case 'timeout':
      // Nunca responde - o Axios aborta após o timeout de 15s
      await delay('infinite')
      return null
    case 'offline':
      // Falha de conexão pura (sem resposta HTTP)
      return HttpResponse.error()
    case 'error':
      // Erro HTTP 500
      await delay(200)
      return HttpResponse.json(
        { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
        { status: 500 },
      )
    default:
      return null
  }
}
