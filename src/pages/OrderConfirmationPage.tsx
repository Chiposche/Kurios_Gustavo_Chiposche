import { useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/endpoints/orders'
import { useAuth } from '../hooks/useAuth'
import { X, Loader, CheckCircle, XCircle } from 'lucide-react'

// Página de Confirmação do Pedido
export function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: isAuthenticated,
    // Refetch enquanto pendente
    refetchInterval: (query) => {
      const order = query.state.data?.data
      if (order?.status === 'pending') return 2000
      return false
    },
  })

  const order = data?.data

  // Limpa o cache do carrinho quando o pedido é confirmado
  useEffect(() => {
    if (order?.status === 'confirmed') {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  }, [order?.status, queryClient])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[#A78B6E]">Faça login para ver seu pedido.</p>
        <Link to="/login" className="text-[#D4944C] hover:underline mt-4 inline-block">Entrar</Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="skeleton-shimmer rounded-xl h-96 max-w-lg mx-auto" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[#C4956A]">Pedido não encontrado.</p>
        <Link to="/" className="text-[#D4944C] hover:underline mt-4 inline-block">Voltar ao início</Link>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 pb-20 md:pb-8">
      <div className="w-full max-w-lg bg-[#2A1F1A] rounded-xl p-8 relative">
        {/* Botão fechar */}
        <Link to="/" className="absolute top-4 right-4 text-[#A78B6E] hover:text-white">
          <X size={20} />
        </Link>

        {/* Ícone e título */}
        <div className="text-center mb-6">
          {order.status === 'pending' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader size={40} className="text-[#D4944C] animate-spin" />
              </div>
              <h1 className="text-white text-xl font-bold">Processando seu pedido...</h1>
              <p className="text-[#A78B6E] text-sm mt-2">Aguarde enquanto confirmamos a transação.</p>
            </>
          )}
          {order.status === 'confirmed' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle size={40} className="text-[#D4944C]" />
              </div>
              <p className="text-[#D4944C] font-mono text-sm">THANK YOU</p>
              <h1 className="text-white text-xl font-bold mt-2">Seus NFTs agora estão na sua carteira</h1>
            </>
          )}
          {order.status === 'declined' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle size={40} className="text-red-400" />
              </div>
              <h1 className="text-white text-xl font-bold">Pagamento recusado</h1>
              <p className="text-[#A78B6E] text-sm mt-2">Tente novamente com outra carteira.</p>
            </>
          )}
        </div>

        {/* Dados da transação */}
        {order.status === 'confirmed' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs border-y border-[#3A2A20] py-3 mb-6">
              <div>
                <p className="text-[#A78B6E]">ID da transação</p>
                <p className="text-[#C4956A] font-mono truncate">{order.transactionId}</p>
              </div>
              <div>
                <p className="text-[#A78B6E]">Data</p>
                <p className="text-white">{new Date(order.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[#A78B6E]">Total</p>
                <p className="text-white font-mono">{order.total} ETH</p>
              </div>
              <div>
                <p className="text-[#A78B6E]">Carteira</p>
                <p className="text-white">{order.wallet}</p>
              </div>
            </div>

            {/* Detalhes da transação */}
            <h2 className="text-white font-bold text-sm mb-4">Detalhes da transação</h2>
            <div className="space-y-3 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/2A1F1A/D4944C?text=NFT'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.name}</p>
                    <p className="text-[#A78B6E] text-xs">ID do token: {item.tokenId}</p>
                  </div>
                  <span className="text-[#A78B6E] text-sm">(x {item.quantity})</span>
                  <span className="text-[#D4944C] font-mono text-sm">{item.subtotal} ETH</span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="border-t border-[#3A2A20] pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A78B6E]">Taxa de rede</span>
                <span className="text-white font-mono">{order.networkFee} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-[#D4944C] font-mono font-bold">{order.total} ETH</span>
              </div>
            </div>

            <p className="text-[#A78B6E] text-xs text-center mt-6">
              Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
            </p>

            <div className="text-center mt-4">
              <button className="border border-[#D4944C] text-[#D4944C] px-6 py-2 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors">
                Ver no Etherscan
              </button>
            </div>
          </>
        )}

        {order.status === 'declined' && (
          <div className="text-center">
            <Link
              to="/cart"
              className="inline-block bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors"
            >
              Voltar ao carrinho
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
