# Arquitetura do KURIO

Anotações sobre como o projeto está organizado, pra facilitar a navegação no código.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Interface | React 19 + TypeScript |
| Roteamento | TanStack Router |
| Estado remoto | TanStack Query |
| HTTP | Axios |
| Tempo real | Socket.IO (client) |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Mocks | MSW + `@mswjs/socket.io-binding` |
| Testes | Playwright (E2E) + Lighthouse |

## Pastas

```
src/
  api/           → cliente Axios, endpoints REST e tipos
  components/    → layout (Navbar, Footer) e componentes shadcn/ui
  hooks/         → useAuth, useSocket, mutations do carrinho
  lib/           → router, query-client, cálculos ETH
  pages/         → uma página por rota
  utils/         → helper de classes CSS (cn)

mocks/           → handlers MSW, banco em memória, fixtures, socket
e2e/             → testes Playwright + helpers
lighthouse/      → config e relatórios
```

## Rotas

Definidas em `src/lib/router.tsx`:

| Rota | Acesso |
| --- | --- |
| `/` | público |
| `/marketplace` | público |
| `/nft/$nftId` | público |
| `/cart` | autenticado |
| `/checkout` | autenticado |
| `/orders/$orderId` | autenticado |
| `/login`, `/register` | público |
| `/profile`, `/wallets`, `/favorites` | autenticado |
| `/criadores`, `/aprenda` | público |
| `*` | 404 |

Rotas privadas checam `useAuth()` e redirecionam pro login se necessário. Filtros e busca ficam na URL como search params.

## Como os mocks funcionam

O MSW intercepta todas as requisições na camada de rede. O banco de dados fica em memória (Map por usuário) e persiste no localStorage pra sobreviver refresh. O botão "Resetar cenário" no footer volta tudo pro estado inicial.

Os handlers REST ficam em `mocks/handlers/` e o socket usa `@mswjs/socket.io-binding` pra emitir eventos como `nft.updated` e `order.updated`.

Em dev o MSW liga automático. No build de produção precisa de `VITE_ENABLE_MSW=true`.

## Cache (TanStack Query)

- `staleTime: 30s` — evita refetch a cada navegação
- `gcTime: 5min` — mantém dados ao voltar pra página anterior
- Mutations invalidam as queries relacionadas
- Favoritos usam atualização otimista com rollback
- Socket events invalidam os caches afetados

## Limitações conhecidas

- Sem carrinho de visitante (precisa logar antes de adicionar)
- Reconexão do socket desabilitada no mock
- Sem retomada de checkout se a sessão expirar
