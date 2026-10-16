import { useEffect, useState } from 'react'
import { Outlet, useLocation } from '@tanstack/react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ErrorBoundary } from '../ErrorBoundary'
import { useSocket } from '../../hooks/useSocket'
import { mswEnabled } from '../../lib/msw'
import {
  getNetworkMode,
  setNetworkMode,
  NETWORK_MODE_EVENT,
  type NetworkMode,
} from '../../lib/network'

const networkModeLabels: Record<NetworkMode, string> = {
  slow: 'Lenta (3s)',
  error: 'Erro 500',
  offline: 'Sem conexão',
  timeout: 'Timeout',
  normal: 'Normal',
}

// Layout principal - aparece em todas as páginas
export function Layout() {
  useSocket()
  const location = useLocation()

  // Modo de rede simulado
  const [networkMode, setNetworkModeState] = useState<NetworkMode>(getNetworkMode)
  useEffect(() => {
    const sync = () => setNetworkModeState(getNetworkMode())
    window.addEventListener(NETWORK_MODE_EVENT, sync)
    return () => window.removeEventListener(NETWORK_MODE_EVENT, sync)
  }, [])

  // Scroll para o topo quando muda de página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1412]">
      <Navbar />
      {mswEnabled && networkMode !== 'normal' && (
        <div role="status" className="bg-[#3A2A20] border-b border-[#D4944C]/40">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-[#E8C9A0]">
              Simulação de rede ativa: <strong>{networkModeLabels[networkMode]}</strong> — as
              requisições estão sendo afetadas.
            </span>
            <button
              type="button"
              onClick={() => setNetworkMode('normal')}
              className="text-[#D4944C] underline shrink-0 hover:text-[#E8C9A0] transition-colors"
            >
              Normalizar
            </button>
          </div>
        </div>
      )}
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
