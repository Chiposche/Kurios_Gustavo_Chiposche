import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletsApi } from '../api/endpoints/wallets'
import { useAuth } from '../hooks/useAuth'
import { ProfileSidebar } from './ProfilePage'

// Página de Gerenciamento de Carteiras
export function WalletsPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newNickname, setNewNickname] = useState('')
  const [newNetwork, setNewNetwork] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newSecondaryAddress, setNewSecondaryAddress] = useState('')
  const [newWalletType, setNewWalletType] = useState('')
  const [newReferralCode, setNewReferralCode] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newEnsName, setNewEnsName] = useState('')
  const [copyToSecondary, setCopyToSecondary] = useState(false)
  const [message, setMessage] = useState('')

  const { data: walletsData, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletsApi.list,
    enabled: isAuthenticated,
  })

  const wallets = walletsData?.data ?? []

  const createMutation = useMutation({
    mutationFn: () =>
      walletsApi.create({
        type: 'primary',
        displayName: newDisplayName,
        nickname: newNickname,
        network: newNetwork,
        profileName: newProfileName,
        address: newAddress,
        secondaryAddress: newSecondaryAddress || undefined,
        walletType: newWalletType,
        referralCode: newReferralCode,
        email: newEmail,
        ensName: newEnsName ? `${newEnsName}.eth` : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      setShowForm(false)
      setNewDisplayName('')
      setNewNickname('')
      setNewNetwork('')
      setNewProfileName('')
      setNewAddress('')
      setNewSecondaryAddress('')
      setNewWalletType('')
      setNewReferralCode('')
      setNewEmail('')
      setNewEnsName('')
      setCopyToSecondary(false)
      setMessage('Carteira adicionada!')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (walletId: string) =>
      walletsApi.update(walletId, { type: 'primary' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      setMessage('Carteira primária atualizada!')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDisplayName || !newAddress || !newNetwork || !newWalletType) return
    createMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton-shimmer rounded-xl h-96" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row gap-8">
        <ProfileSidebar active="wallets" />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">Carteiras</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-[#D4944C] text-sm hover:underline transition-colors"
            >
              Adicionar
            </button>
          </div>

          {message && (
            <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-2 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Formulário para adicionar carteira */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-[#2A1F1A] rounded-xl p-6 mb-6">
              {/* Carteira principal */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-bold">Carteira principal</h2>
              </div>
              <p className="text-[#A78B6E] text-sm mb-6">
                Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Nome de exibição */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Nome de exibição<span className="text-[#D4944C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* Apelido da carteira */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Apelido da carteira
                  </label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* Rede */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Rede<span className="text-[#D4944C]">*</span>
                  </label>
                  <select
                    value={newNetwork}
                    onChange={(e) => setNewNetwork(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                  >
                    <option value="" disabled>Selecione uma rede</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="solana">Solana</option>
                    <option value="binance">Binance Smart Chain</option>
                  </select>
                </div>

                {/* Nome do perfil */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Nome do perfil<span className="text-[#D4944C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* Endereço da carteira */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Endereço da carteira<span className="text-[#D4944C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Endereço da carteira"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* ENS ou carteira secundária */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    ENS ou carteira secundária (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ENS ou carteira secundária (opcional)"
                    value={newSecondaryAddress}
                    onChange={(e) => setNewSecondaryAddress(e.target.value)}
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* Tipo de carteira */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Tipo de carteira<span className="text-[#D4944C]">*</span>
                  </label>
                  <select
                    value={newWalletType}
                    onChange={(e) => setNewWalletType(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C]"
                  >
                    <option value="" disabled>Selecione uma carteira</option>
                    <option value="metamask">MetaMask</option>
                    <option value="coinbase">Coinbase Wallet</option>
                    <option value="trust">Trust Wallet</option>
                    <option value="phantom">Phantom</option>
                  </select>
                </div>

                {/* Código de indicação */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Código de indicação<span className="text-[#D4944C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReferralCode}
                    onChange={(e) => setNewReferralCode(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    E-mail<span className="text-[#D4944C]">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                  />
                </div>

                {/* Nome ENS com sufixo .eth */}
                <div>
                  <label className="text-[#C4956A] text-sm mb-1 block">
                    Nome ENS<span className="text-[#D4944C]">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newEnsName}
                      onChange={(e) => setNewEnsName(e.target.value)}
                      required
                      className="flex-1 bg-[#1A1412] border border-[#3A2A20] rounded-l px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]"
                    />
                    <span className="bg-[#1A1412] border border-l-0 border-[#3A2A20] rounded-r px-3 py-3 text-[#A78B6E] text-sm flex items-center">
                      .eth
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#D4944C] text-black px-6 py-2 rounded font-bold hover:bg-[#E0A55D] transition-colors disabled:opacity-50 mt-2"
              >
                {createMutation.isPending ? 'Salvando...' : 'Salvar carteira'}
              </button>

              {/* Seção Carteira secundária */}
              <div className="mt-8 pt-6 border-t border-[#3A2A20]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold">Carteira secundária</h3>
                  <button
                    type="button"
                    className="text-[#D4944C] text-sm hover:underline"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    id="copyPrimary"
                    checked={copyToSecondary}
                    onChange={() => setCopyToSecondary(!copyToSecondary)}
                    className="accent-[#D4944C]"
                  />
                  <label htmlFor="copyPrimary" className="text-[#A78B6E] text-sm cursor-pointer">
                    Igual à carteira principal
                  </label>
                </div>
                <p className="text-[#A78B6E] text-sm">
                  Você ainda não adicionou uma carteira secundária.
                </p>
              </div>
            </form>
          )}

          {/* Lista de carteiras */}
          {wallets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#A78B6E]">Nenhuma carteira cadastrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-[#2A1F1A] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#3A2A20] rounded-full flex items-center justify-center text-[#D4944C] font-bold text-sm">
                      {wallet.network?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white text-sm font-medium">{wallet.displayName}</h3>
                        {wallet.type === 'primary' && (
                          <span className="bg-[#D4944C]/20 text-[#D4944C] text-xs px-2 py-0.5 rounded">
                            Primária
                          </span>
                        )}
                      </div>
                      <p className="text-[#A78B6E] text-xs font-mono truncate max-w-[200px] md:max-w-xs">
                        {wallet.address}
                      </p>
                      <p className="text-[#A78B6E] text-xs capitalize">{wallet.network}</p>
                    </div>
                  </div>

                  {wallet.type !== 'primary' && (
                    <button
                      onClick={() => setPrimaryMutation.mutate(wallet.id)}
                      disabled={setPrimaryMutation.isPending}
                      className="border border-[#D4944C] text-[#D4944C] px-4 py-2 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
                    >
                      Tornar primária
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
