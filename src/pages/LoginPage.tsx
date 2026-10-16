import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

// Página de Login
export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pb-20 md:pb-0">
      <div className="w-full max-w-md">
        {/* Logo no mobile */}
        <h1 className="text-center font-mono text-3xl font-bold text-[#D4944C] mb-8 tracking-widest">
          KURIO
        </h1>

        <div className="bg-[#2A1F1A] rounded-xl p-6 md:p-8">
          {/* Tabs Entrar / Criar conta */}
          <div className="flex gap-4 mb-6">
            <span className="text-white font-bold border-b-2 border-[#D4944C] pb-2">Entrar</span>
            <Link to="/register" className="text-[#A78B6E] pb-2 hover:text-[#C4956A]">
              Criar conta
            </Link>
          </div>

          <p className="text-[#A78B6E] text-sm mb-6">
            Entre para gerenciar sua carteira, coleção e perfil de criador.
          </p>

          {/* Mensagem de erro */}
          {error && (
            <div id="login-error" className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="contato@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="E-mail"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
                aria-label="Senha"
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78B6E] hover:text-[#C4956A]"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <span className="text-[#C4956A] text-sm cursor-default">Esqueceu a senha?</span>
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Login social (apenas visual, fora do escopo) */}
          <div className="mt-6">
            <p className="text-center text-[#A78B6E] text-sm mb-4">Ou continue com</p>
            <div className="space-y-3">
              <Button type="button" variant="outline" size="lg" className="font-normal">
                <span className="mr-2">G</span> Continuar com Google
              </Button>
              <Button type="button" variant="outline" size="lg" className="font-normal">
                <span className="mr-2">f</span> Continuar com Facebook
              </Button>
            </div>
          </div>

          {/* Link para mobile */}
          <p className="text-center text-[#A78B6E] text-sm mt-6 md:hidden">
            Novo na Kurio?{' '}
            <Link to="/register" className="text-[#D4944C]">Crie uma conta</Link>
          </p>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-4 text-center text-[#A78B6E] text-xs">
          <p>Credenciais de teste: contato@email.com / Senha123!</p>
        </div>
      </div>
    </div>
  )
}
