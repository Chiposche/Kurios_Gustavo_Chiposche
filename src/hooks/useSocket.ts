import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

// Conexão Socket.IO pra atualizações em tempo real
export function useSocket() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  // Pra ignorar eventos duplicados
  const orderVersions = useRef(new Map<string, number>())

  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false,
    })

    socketRef.current = socket

    socket.on('connect_error', () => {})

    // Invalida os caches quando o servidor atualiza algo
    socket.on('nft.updated', (data: { nftId: string; version?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      queryClient.invalidateQueries({ queryKey: ['nft', data.nftId] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['quote'] })
    })

    // Controle de versão pra ignorar eventos antigos
    socket.on('order.updated', (data: { orderId: string; status?: string; version?: number }) => {
      if (data.version != null) {
        const lastVersion = orderVersions.current.get(data.orderId) ?? 0
        if (data.version < lastVersion) return
        orderVersions.current.set(data.orderId, data.version)
      }

      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] })
    })

    // Cleanup
    return () => {
      socket.disconnect()
      orderVersions.current.clear()
    }
  }, [queryClient])

  return socketRef
}
