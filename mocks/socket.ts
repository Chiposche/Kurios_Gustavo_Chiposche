import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { changeNftPrice } from './scenarios'

// Mock do Socket.IO usando MSW WebSocket handlers
// Simula eventos em tempo real para desenvolvimento
// Padrão "*": o MSW remove o prefixo /socket.io/ da URL antes de casar e o
// curinga cobre qualquer origem (localhost, [::1], vercel.app, wss://...)
const socketHandler = ws.link('*')

// Clientes conectados - permite que os handlers REST emitem eventos em tempo real
type SocketClient = {
  emit: (event: string, payload: unknown) => void
}
const connectedClients = new Set<SocketClient>()

// Emite o evento order.updated para todos os clientes conectados
// Chamado pelo handler de pedidos quando o status muda (confirmado/recusado)
export function emitOrderUpdated(orderId: string, status: string, version: number): void {
  const payload = { orderId, status, version }
  connectedClients.forEach((client) => {
    try {
      client.emit('order.updated', payload)
    } catch {
      // Cliente pode ter desconectado - ignora
    }
  })
}

// Emite o evento nft.updated quando o preço de um NFT muda
export function emitNftUpdated(nftId: string, version: number): void {
  const payload = { nftId, version }
  connectedClients.forEach((client) => {
    try {
      client.emit('nft.updated', payload)
    } catch {
      // Cliente pode ter desconectado - ignora
    }
  })
}

export const socketHandlers = [
  socketHandler.addEventListener('connection', (connection) => {
    const { client: ioClient } = toSocketIo(connection)

    console.log('[Socket Mock] Cliente conectado')
    connectedClients.add(ioClient)

    // Simula uma atualização de preço a cada 30 segundos
    const nftInterval = setInterval(() => {
      const change = changeNftPrice()
      if (change) emitNftUpdated(change.nftId, change.version)
    }, 30000)

    connection.client.addEventListener('close', () => {
      clearInterval(nftInterval)
      connectedClients.delete(ioClient)
      console.log('[Socket Mock] Cliente desconectado')
    })
  }),
]
