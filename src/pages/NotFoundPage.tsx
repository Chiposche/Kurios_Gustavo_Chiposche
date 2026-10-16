import { Link } from '@tanstack/react-router'

// Página 404 - quando a rota não existe
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 pb-20 md:pb-0">
      <h1 className="text-6xl font-mono font-bold text-[#D4944C] mb-4">404</h1>
      <p className="text-[#C4956A] text-lg mb-8">Página não encontrada</p>
      <Link
        to="/"
        className="bg-[#D4944C] text-black px-6 py-3 rounded font-medium hover:bg-[#E0A55D] transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
