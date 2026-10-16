// Simula condições de rede diferentes pra testar loading/erro

export type NetworkMode = 'normal' | 'slow' | 'error' | 'offline' | 'timeout'

const STORAGE_KEY = 'kurio_network_mode'

// Evento pra avisar os componentes quando o modo muda
export const NETWORK_MODE_EVENT = STORAGE_KEY + ':changed'

export function getNetworkMode(): NetworkMode {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value === 'slow' || value === 'error' || value === 'offline' || value === 'timeout') {
    return value
  }
  return 'normal'
}

export function setNetworkMode(mode: NetworkMode): void {
  localStorage.setItem(STORAGE_KEY, mode)
  // Avisa a interface pra re-renderizar
  window.dispatchEvent(new Event(NETWORK_MODE_EVENT))
}
