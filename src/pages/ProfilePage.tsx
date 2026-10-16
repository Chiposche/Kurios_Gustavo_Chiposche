import { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/endpoints/profile'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, User, Wallet, ShoppingCart, Heart, FileText, Download, HelpCircle, LogOut } from 'lucide-react'

// Sidebar do perfil - reutilizada em Profile e Wallets
export function ProfileSidebar({ active }: { active: 'profile' | 'wallets' }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  const items = [
    { label: 'Dados do perfil', to: '/profile', key: 'profile', icon: <User size={16} /> },
    { label: 'Carteiras', to: '/wallets', key: 'wallets', icon: <Wallet size={16} /> },
    { label: 'Atividade', to: '#', key: 'activity', icon: <ShoppingCart size={16} /> },
    { label: 'Lista de interesse', to: '#', key: 'wishlist', icon: <Heart size={16} /> },
    { label: 'Ofertas', to: '#', key: 'offers', icon: <FileText size={16} /> },
    { label: 'Arquivos baixados', to: '#', key: 'downloads', icon: <Download size={16} /> },
    { label: 'Suporte', to: '#', key: 'support', icon: <HelpCircle size={16} /> },
  ]

  return (
    <aside className="w-full md:w-64 shrink-0">
      <h2 className="text-white font-bold text-lg mb-4 hidden md:block">Meu perfil</h2>
      {/* Mobile: scroll horizontal */}
      <nav className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to as any}
            className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded text-sm transition-colors whitespace-nowrap ${
              active === item.key
                ? 'text-[#D4944C] md:border-l-2 border-[#D4944C] bg-[#2A1F1A]'
                : 'text-[#C4956A] hover:text-[#D4944C]'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 md:gap-3 px-3 py-2 rounded text-sm text-[#D4944C] hover:bg-[#2A1F1A] whitespace-nowrap"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </nav>
    </aside>
  )
}

// Página de Perfil do Colecionador
export function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [walletNickname, setWalletNickname] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    enabled: isAuthenticated,
  })

  const profile = profileData?.data

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setUsername(profile.username || '')
      setEmail(profile.email || '')
      setEnsName(profile.ensName || '')
      setWalletNickname(profile.walletNickname || '')
    }
  }, [profile])

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      profileApi.update({ displayName, username, email, ensName, walletNickname }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
      setMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: () => setMessage('Erro ao atualizar perfil'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      profileApi.changePassword({ currentPassword, newPassword, confirmPassword }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      setMessage('Senha alterada com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.errors?.currentPassword?.[0] || err.response?.data?.message || 'Erro ao alterar senha')
    },
  })

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate()
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    changePasswordMutation.mutate()
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
        <ProfileSidebar active="profile" />

        <div className="flex-1">
          <h1 className="text-xl font-bold text-white mb-6">Perfil do colecionador</h1>

          {message && (
            <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-2 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Formulário do perfil */}
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Nome de exibição<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Nome de usuário<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  E-mail<span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Nome ENS<span className="text-red-400">*</span>
                </label>
                <div className="flex">
                  <select className="bg-[#1A1412] border border-[#3A2A20] rounded-l px-3 py-3 text-white text-sm">
                    <option>.eth</option>
                  </select>
                  <input
                    type="text"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="flex-1 bg-[#1A1412] border border-[#3A2A20] border-l-0 rounded-r px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">
                  Apelido da carteira<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={walletNickname}
                  onChange={(e) => setWalletNickname(e.target.value)}
                  className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
                />
              </div>
              <div>
                <label className="text-[#C4956A] text-sm mb-1 block">Avatar</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3A2A20] rounded-full flex items-center justify-center text-[#A78B6E]">
                    <User size={20} />
                  </div>
                  <button type="button" className="border border-[#D4944C] text-[#D4944C] px-4 py-2 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors">
                    Alterar
                  </button>
                  <button type="button" className="text-[#A78B6E] text-sm hover:text-white">
                    Remover
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-[#D4944C] text-black px-8 py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors disabled:opacity-50 mb-8"
            >
              {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </form>

          {/* Alterar senha */}
          <h2 className="text-white font-bold mb-4">Alterar senha</h2>
          {passwordError && (
            <div id="password-change-error" className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-4 text-sm">
              {passwordError}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="relative">
              <label className="text-[#C4956A] text-sm mb-1 block">Senha atual</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-describedby={passwordError ? 'password-change-error' : undefined}
                className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 bottom-3 text-[#A78B6E]"
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div>
              <label className="text-[#C4956A] text-sm mb-1 block">Nova senha</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-describedby={passwordError ? 'password-change-error' : undefined}
                className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
              />
            </div>
            <div>
              <label className="text-[#C4956A] text-sm mb-1 block">Confirmar nova senha</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-describedby={passwordError ? 'password-change-error' : undefined}
                className="w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
              />
            </div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="bg-[#D4944C] text-black px-8 py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'Alterando...' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
