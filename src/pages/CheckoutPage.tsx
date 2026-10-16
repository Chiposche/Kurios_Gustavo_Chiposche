import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/endpoints/cart'
import { ordersApi } from '../api/endpoints/orders'
import { useAuth } from '../hooks/useAuth'
import { ChevronLeft } from 'lucide-react'

// Carteiras disponíveis para pagamento (simuladas)
const walletOptions = [
  { id: 'metamask', name: 'MetaMask', icon: 'M' },
  { id: 'walletconnect', name: 'WalletConnect', icon: 'W' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: 'C' },
  // Carteira de teste: simula um pagamento recusado pelo provedor
  { id: 'test-declined', name: 'Carteira de teste (recusa o pagamento)', icon: '!' },
]

// Página de Checkout / Pagamento
export function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    collectorName: user?.displayName || '',
    collectorUsername: user?.username || '',
    collectorEmail: user?.email || '',
    network: '',
    walletAddress: '',
    walletType: '',
    ensName: '',
    referralCode: '',
    notes: '',
  })
  const [selectedWallet, setSelectedWallet] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Chave de idempotência: gerada uma vez e reusada em retentativas
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        collectorName: prev.collectorName || user.displayName,
        collectorUsername: prev.collectorUsername || user.username,
        collectorEmail: prev.collectorEmail || user.email,
      }))
    }
  }, [user])

  const { data: quoteData } = useQuery({
    queryKey: ['quote'],
    queryFn: () => cartApi.getQuote(),
    enabled: isAuthenticated,
  })

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  })

  const quote = quoteData?.data
  const cart = cartData?.data

  // Se o preço mudar durante a navegação, bloqueia a confirmação
  // e pede pro usuário revisar os valores atualizados
  const quoteSnapshotRef = useRef<{ subtotal: string; total: string } | null>(null)
  const [quoteStale, setQuoteStale] = useState(false)

  useEffect(() => {
    if (!quote) return
    const current = { subtotal: quote.subtotal, total: quote.total }
    const prev = quoteSnapshotRef.current
    if (prev && (prev.subtotal !== current.subtotal || prev.total !== current.total)) {
      setQuoteStale(true)
    }
    quoteSnapshotRef.current = current
  }, [quote])

  const createOrderMutation = useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      ordersApi.create(
        {
          walletId: selectedWallet,
          network: formData.network || 'ethereum',
          collectorName: formData.collectorName,
          collectorUsername: formData.collectorUsername,
          collectorEmail: formData.collectorEmail,
          walletAddress: formData.walletAddress,
          walletType: selectedWallet,
          ensName: formData.ensName,
          referralCode: formData.referralCode,
          notes: formData.notes,
        },
        idempotencyKey,
      ),
    onSuccess: (data) => {
      // Gera nova key para um eventual próximo pedido
      idempotencyKeyRef.current = crypto.randomUUID()
      // Invalida o carrinho e navega para a confirmação
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate({ to: '/orders/$orderId', params: { orderId: data.data.id } })
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao processar pedido')
      setSubmitting(false)
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton-shimmer rounded-xl h-96" />
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedWallet) {
      setError('Selecione uma carteira')
      return
    }
    if (!formData.collectorName || !formData.collectorEmail) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    // Revalida a cotação antes de confirmar
    if (!quote) {
      setError('Cotação indisponível - verifique o carrinho e tente novamente')
      return
    }
    if (Date.now() > quote.validUntil) {
      queryClient.invalidateQueries({ queryKey: ['quote'] })
      setError('A cotação expirou. Os valores serão atualizados - revise e confirme novamente')
      return
    }
    if (quoteStale) {
      // Primeira tentativa após mudança de preço: bloqueia e libera a próxima
      setQuoteStale(false)
      setError('A cotação mudou durante a navegação. Revise os valores e confirme novamente')
      return
    }

    setSubmitting(true)
    // Usa a mesma chave de idempotência em retentativas para recuperar o mesmo pedido
    createOrderMutation.mutate({ idempotencyKey: idempotencyKeyRef.current })
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate({ to: '/cart' })} className="text-[#C4956A]">
          <ChevronLeft size={24} />
        </button>
        <div>
          <div className="text-[#A78B6E] text-sm hidden md:block">Início / Mercado / Pagamento</div>
          <h1 className="text-lg md:text-2xl font-mono text-white">Pagamento com carteira</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulário do colecionador */}
          <div className="flex-1">
            <h2 className="text-white font-bold mb-6">Perfil do colecionador</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Nome de exibição<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.collectorName}
                  onChange={(e) => updateField('collectorName', e.target.value)}
                  required
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Nome de usuário<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.collectorUsername}
                  onChange={(e) => updateField('collectorUsername', e.target.value)}
                  required
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Rede<span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.network}
                  onChange={(e) => updateField('network', e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                >
                  <option value="">Selecione uma rede</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="solana">Solana</option>
                </select>
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">Nome do perfil</label>
                <input
                  type="text"
                  value={formData.collectorUsername}
                  onChange={(e) => updateField('collectorUsername', e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">Endereço da carteira</label>
                <input
                  type="text"
                  placeholder="Endereço 0x da carteira"
                  value={formData.walletAddress}
                  onChange={(e) => updateField('walletAddress', e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">Nome ENS</label>
                <div className="flex">
                  <select className="bg-[#1A1412] border border-[#3A2A20] rounded-l px-3 py-3 text-white text-sm">
                    <option>.eth</option>
                  </select>
                  <input
                    type="text"
                    value={formData.ensName}
                    onChange={(e) => updateField('ensName', e.target.value)}
                    className="flex-1 bg-[#1A1412] border border-[#3A2A20] border-l-0 rounded-r px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  E-mail<span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.collectorEmail}
                  onChange={(e) => updateField('collectorEmail', e.target.value)}
                  required
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">Código de indicação</label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => updateField('referralCode', e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[#C4956A] text-sm mb-1 block">Observação do colecionador (opcional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] resize-none"
              />
            </div>
          </div>

          {/* Resumo e carteira */}
          <aside className="lg:w-96">
            {/* Itens do pedido */}
            <div className="bg-[#2A1F1A] rounded-xl p-6 mb-4">
              <h2 className="text-white font-bold mb-4">Seus NFTs</h2>
              <div className="space-y-3">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
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
                    <div className="text-right">
                      <span className="text-[#A78B6E] text-xs">(x {item.quantity})</span>
                      <p className="text-[#D4944C] font-mono text-sm">{item.total} ETH</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Valores */}
              <div className="space-y-2 border-t border-[#3A2A20] mt-4 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A78B6E]">Subtotal</span>
                  <span className="text-white font-mono">{quote?.subtotal ?? '0.00'} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A78B6E]">Desconto</span>
                  <span className="text-white font-mono">(-) {quote?.discount ?? '00.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A78B6E]">Taxa de rede</span>
                  <span className="text-white font-mono">{quote?.networkFee ?? '0.016'} ETH</span>
                </div>
                <div className="flex justify-between border-t border-[#3A2A20] pt-2">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#D4944C] font-mono font-bold">{quote?.total ?? '0.000'} ETH</span>
                </div>
              </div>
            </div>

            {/* Seleção de carteira */}
            <div className="bg-[#2A1F1A] rounded-xl p-6">
              <h2 className="text-white font-bold mb-4">Carteira e rede</h2>
              <div className="space-y-3">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      selectedWallet === wallet.id
                        ? 'border-[#D4944C] bg-[#1A1412]'
                        : 'border-[#3A2A20] hover:border-[#D4944C]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedWallet === wallet.id ? 'bg-[#D4944C] text-black' : 'bg-[#3A2A20] text-[#C4956A]'
                    }`}>
                      {wallet.icon}
                    </div>
                    <span className="text-white text-sm">{wallet.name}</span>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 ${
                      selectedWallet === wallet.id ? 'border-[#D4944C] bg-[#D4944C]' : 'border-[#3A2A20]'
                    }`} />
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D4944C] text-black py-3 rounded font-bold mt-6 hover:bg-[#E0A55D] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processando...' : 'Confirmar compra'}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
