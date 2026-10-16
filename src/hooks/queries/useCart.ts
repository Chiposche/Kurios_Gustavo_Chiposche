import { useQuery } from '@tanstack/react-query'
import { cartApi } from '../../api/endpoints/cart'
import { useAuth } from '../useAuth'

// Hook para buscar o carrinho do usuário usando TanStack Query
export function useCart() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    // Só busca o carrinho se o usuário estiver logado
    enabled: isAuthenticated,
    staleTime: 30_000, // 30 segundos
  })
}
