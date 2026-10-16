import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/endpoints/cart'
import { useAuth } from '../hooks/useAuth'
import { Minus, Plus, Trash2, ChevronLeft } from 'lucide-react'
import { Dialog, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'

// Página do Carrinho de NFTs
export function CartPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [removeDialogItem, setRemoveDialogItem] = useState<string | null>(null)

  // Compara preços pra avisar se mudou
  const pricesRef = useRef<Record<string, string> | null>(null)
  const [priceAlert, setPriceAlert] = useState<{
    name: string
    oldPrice: string
    newPrice: string
  } | null>(null)

  // Hooks precisam ficar antes de qualquer return condicional
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  })

  const { data: quoteData } = useQuery({
    queryKey: ['quote', appliedCoupon],
    queryFn: () => cartApi.getQuote(appliedCoupon ? { couponCode: appliedCoupon } : undefined),
    enabled: isAuthenticated && (cartData?.data?.items?.length ?? 0) > 0,
  })

  const cart = cartData?.data
  const quote = quoteData?.data

  // Detecta mudança de preço via socket
  useEffect(() => {
    const items = cartData?.data?.items
    if (!items) return
    const next: Record<string, string> = {}
    items.forEach((item) => {
      next[item.nftId] = item.price
    })
    const prev = pricesRef.current
    if (prev) {
      for (const item of items) {
        const oldPrice = prev[item.nftId]
        if (oldPrice && oldPrice !== item.price) {
          setPriceAlert({ name: item.name, oldPrice, newPrice: item.price })
          break
        }
      }
    }
    pricesRef.current = next
  }, [cartData])

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
  })

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center pb-20 md:pb-0">
        <h1 className="text-2xl font-mono text-white mb-4">Carrinho de NFTs</h1>
        <p className="text-[#A78B6E] mb-6">Faça login para ver seu carrinho.</p>
        <Link to="/login" className="bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D]">
          Entrar
        </Link>
      </div>
    )
  }

  const handleApplyCoupon = async () => {
    setCouponError('')
    try {
      await cartApi.getQuote({ couponCode })
      setAppliedCoupon(couponCode)
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Cupom inválido')
      setAppliedCoupon(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="rounded-xl h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center pb-20 md:pb-0">
        <h1 className="text-2xl font-mono text-white mb-4">Carrinho de NFTs</h1>
        <p className="text-[#A78B6E] mb-6">Seu carrinho está vazio.</p>
        <Link to="/" className="bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D]">
          Explorar NFTs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate({ to: '/' })} className="md:hidden text-[#C4956A]">
          <ChevronLeft size={24} />
        </button>
        <div>
          <div className="text-[#A78B6E] text-sm hidden md:block">Início / Mercado / Carrinho</div>
          <h1 className="text-xl md:text-2xl font-mono text-white">Carrinho de NFTs</h1>
        </div>
      </div>

      {/* Aviso de preço alterado em tempo real */}
      {priceAlert && (
        <div
          role="status"
          className="bg-[#2A1F1A] border border-[#D4944C] rounded-lg px-4 py-3 mb-6 flex items-start justify-between gap-3"
        >
          <p className="text-sm text-[#C4956A]">
            Preço de <strong className="text-white">{priceAlert.name}</strong>             foi alterado:{' '}
            <span className="font-mono">{priceAlert.oldPrice} ETH</span> →{' '}
            <span className="font-mono text-[#D4944C]">{priceAlert.newPrice} ETH</span>. O resumo
            abaixo já foi atualizado.
          </p>
          <button
            onClick={() => setPriceAlert(null)}
            aria-label="Fechar aviso de preço"
            className="text-[#A78B6E] hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de itens */}
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 text-[#A78B6E] text-sm border-b border-[#3A2A20] pb-3 mb-4">
            <span>NFTs</span>
            <span>Preço</span>
            <span>Edições</span>
            <span>Total</span>
            <span></span>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#2A1F1A] rounded-xl p-4 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
              >
                {/* Mobile: layout horizontal compacto */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/2A1F1A/D4944C?text=NFT'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-[#A78B6E] text-xs">Edição: {item.editionLabel}</p>
                    <p className="text-[#D4944C] font-mono text-sm mt-1">{item.price} ETH</p>
                  </div>
                  {/* Quantidade no mobile: ao lado direito */}
                  <div className="flex items-center gap-1 md:hidden">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeMutation.mutate(item.id)
                        } else {
                          updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                        }
                      }}
                      className="text-[#D4944C] bg-[#1A1412] rounded p-1.5"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-white font-mono text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={item.quantity >= item.maxQuantity}
                      className="text-[#D4944C] bg-[#1A1412] rounded p-1.5 disabled:opacity-30"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Desktop: colunas separadas (escondido no mobile) */}
                <div className="hidden md:block">
                  <span className="text-[#D4944C] font-mono text-sm">{item.price} ETH</span>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        removeMutation.mutate(item.id)
                      } else {
                        updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      }
                    }}
                    className="text-[#D4944C] bg-[#1A1412] rounded p-1"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-white font-mono text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    disabled={item.quantity >= item.maxQuantity}
                    className="text-[#D4944C] bg-[#1A1412] rounded p-1 disabled:opacity-30"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="hidden md:flex justify-between items-center">
                  <span className="text-[#D4944C] font-mono text-sm">{item.total} ETH</span>
                </div>

                <button
                  onClick={() => setRemoveDialogItem(item.id)}
                  className="text-[#A78B6E] hover:text-red-400"
                  aria-label={`Remover ${item.name} do carrinho`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:w-80">
          <div className="bg-[#2A1F1A] rounded-xl p-6 sticky top-4">
            <h2 className="text-white font-bold mb-4">Resumo da carteira</h2>

            <div className="mb-4">
              <label className="text-[#A78B6E] text-sm mb-2 block">Código promocional</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o código..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#1A1412] border border-[#3A2A20] rounded px-3 py-2 text-white text-sm placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="border border-[#D4944C] text-[#D4944C] px-4 py-2 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
              {appliedCoupon && !couponError && (
                <p className="text-green-400 text-xs mt-1">Cupom aplicado!</p>
              )}
            </div>

            <div className="space-y-3 border-t border-[#3A2A20] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#A78B6E]">Subtotal</span>
                <span className="text-white font-mono">{quote?.subtotal ?? '0.00'} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A78B6E]">Desconto do lançamento</span>
                <span className="text-white font-mono">(-) {quote?.discount ?? '00.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A78B6E]">Taxa de rede</span>
                <span className="text-white font-mono">{quote?.networkFee ?? '0.016'} ETH</span>
              </div>
              <p className="text-[#D4944C] text-xs text-right">Taxa estimada</p>
              <div className="flex justify-between border-t border-[#3A2A20] pt-3">
                <span className="text-white font-bold">Total</span>
                <span className="text-[#D4944C] font-mono font-bold text-lg">{quote?.total ?? '0.000'} ETH</span>
              </div>
            </div>

            <button
              onClick={() => navigate({ to: '/checkout' })}
              className="w-full bg-[#D4944C] text-black py-3 rounded font-bold mt-6 hover:bg-[#E0A55D] transition-colors"
            >
              Conectar e finalizar
            </button>

            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full text-[#C4956A] py-2 text-sm mt-2 hover:text-white"
            >
              Continuar explorando
            </button>
          </div>
        </aside>
      </div>

      {/* Dialog de confirmação para remover item */}
      <Dialog open={!!removeDialogItem} onClose={() => setRemoveDialogItem(null)}>
        <DialogTitle>Remover do carrinho</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja remover este item do carrinho?
        </DialogDescription>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setRemoveDialogItem(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (removeDialogItem) {
                removeMutation.mutate(removeDialogItem)
                setRemoveDialogItem(null)
              }
            }}
          >
            Remover
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
