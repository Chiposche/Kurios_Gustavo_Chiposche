import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

// Página de Cadastro
export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await register({ username, email, password, confirmPassword })
      navigate({ to: '/' })
    } catch (err: any) {
      const data = err.response?.data
      setError(data?.message || 'Erro ao criar conta')
      if (data?.errors) setFieldErrors(data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pb-20 md:pb-0">
      <div className="w-full max-w-md">
        <h1 className="text-center font-mono text-3xl font-bold text-[#D4944C] mb-8 tracking-widest">
          KURIO
        </h1>

        <div className="bg-[#2A1F1A] rounded-xl p-6 md:p-8">
          <div className="flex gap-4 mb-6">
            <Link to="/login" className="text-[#A78B6E] pb-2 hover:text-[#C4956A]">
              Entrar
            </Link>
            <span className="text-white font-bold border-b-2 border-[#D4944C] pb-2">Criar conta</span>
          </div>

          <p className="text-[#A78B6E] text-sm mb-6">
            Crie seu perfil de colecionador e conecte uma carteira quando quiser.
          </p>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-label="Nome de usuário"
              />
              {fieldErrors.username && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.username[0]}</p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="E-mail"
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
                aria-label="Senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78B6E]"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-label="Confirmar senha"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

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

          <p className="text-center text-[#A78B6E] text-sm mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#D4944C]">Entre</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
