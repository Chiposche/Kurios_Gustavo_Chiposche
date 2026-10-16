# Arquitetura do KURIO

Anotações sobre como o projeto está organizado, pra facilitar a navegação no código.

## Stack

- React 19 + TypeScript
- TanStack Router (rotas)
- TanStack Query (cache, loading, erro)
- Axios (cliente HTTP, baseURL `/api`)
- Socket.IO client (tempo real)
- Tailwind CSS 4 + shadcn/ui (Button, Input, Badge, Card, Select, Dialog, Skeleton)
- MSW + @mswjs/socket.io-binding (mocks)
- Playwright (testes E2E) + Lighthouse (auditoria)

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

Definidas em `src/lib/router.tsx`. Rotas privadas checam `useAuth()` e redirecionam pro login. Filtros e busca ficam na URL como search params.

- `/` — home (público)
- `/marketplace` — catálogo com busca, filtros, paginação (público)
- `/nft/$nftId` — detalhe do NFT (público)
- `/cart` — carrinho (autenticado)
- `/checkout` — pagamento (autenticado)
- `/orders/$orderId` — confirmação do pedido (autenticado)
- `/login`, `/register` — sessão (público)
- `/profile`, `/wallets`, `/favorites` — conta (autenticado)
- `/criadores`, `/aprenda` — páginas extras (público)
- `*` — 404

## Endpoints REST

Tudo sob `/api`:

- **Sessão:** POST /auth/login, /auth/register, /auth/logout, GET /auth/session
- **NFTs:** GET /nfts (com filtros, busca, ordenação, paginação), GET /nfts/:id
- **Favoritos:** GET /favorites, POST /favorites/:nftId, DELETE /favorites/:nftId
- **Carrinho:** GET /cart, POST /cart/items, PUT /cart/items/:id, DELETE /cart/items/:id
- **Cotação:** POST /cart/quote (aceita couponCode)
- **Pedidos:** POST /orders (com idempotencyKey), GET /orders/:id
- **Perfil:** GET /profile, PUT /profile, PUT /profile/password
- **Carteiras:** GET /wallets, POST /wallets, PUT /wallets/:id

Erros voltam com status HTTP certo (401, 404, 409, 422) e um campo `message`.

## Sessão

O token vem do login e fica no sessionStorage (sobrevive refresh mas não vaza entre abas). O Axios injeta o token no header de toda requisição. Se o servidor responde 401, o token é removido. No logout, limpa todo o cache do TanStack Query pra não vazar dados entre usuários.

## Carrinho

Cada usuário tem seu carrinho separado no mock. Precisa estar logado pra usar. Cupom valida pela API, o front nunca calcula desconto. Valores em ETH são strings decimais e os cálculos usam decimal.js-light pra não perder precisão.

## Como os mocks funcionam

O MSW intercepta todas as requisições na camada de rede. O banco de dados fica em memória (Map por usuário) e persiste no localStorage pra sobreviver refresh. O botão "Resetar cenário" no footer volta tudo pro estado inicial.

Os handlers REST ficam em `mocks/handlers/` e o socket usa `@mswjs/socket.io-binding` pra emitir eventos como `nft.updated` e `order.updated`.

Em dev o MSW liga automático. No build de produção precisa de `VITE_ENABLE_MSW=true`.

## Cache (TanStack Query)

- `staleTime: 30s` — evita refetch a cada navegação
- `gcTime: 5min` — mantém dados ao voltar pra página anterior
- Mutations invalidam as queries relacionadas
- Favoritos usam atualização otimista com rollback se der erro
- Socket events invalidam os caches afetados (catálogo, detalhe, carrinho, cotação)

## Socket.IO

O hook useSocket conecta no Layout e escuta dois eventos:

- **nft.updated** — quando o preço de um NFT muda, invalida o cache do catálogo, detalhe, carrinho e cotação
- **order.updated** — quando o status do pedido muda (pendente → confirmado/recusado), invalida o cache do pedido

Os eventos têm um campo `version` pra ignorar duplicatas e eventos antigos. No mock, o MSW intercepta o WebSocket e o @mswjs/socket.io-binding traduz pro protocolo do Socket.IO.

Limitações do transporte no mock:
- Reconexão automática desabilitada (não tem servidor real pra reconectar)
- Cada aba do navegador é um "servidor" isolado
- Não tem namespace nem rooms, só broadcast

## Decisões de UX

- Visual segue o Figma (paleta dourada/terracota, fontes mono nos títulos)
- Skeletons com shimmer nos loadings, respeitando prefers-reduced-motion
- "Minha coleção" do footer virou a página de favoritos (/favorites)
- Botão de reset e seletor de rede no footer só aparecem com mocks ativos
- Home mostra os 8 NFTs mais recentes como destaques, busca e filtros levam pro /marketplace

## Limitações conhecidas

- Sem carrinho de visitante (precisa logar antes de adicionar)
- Reconexão do socket desabilitada no mock
- Sem retomada de checkout se a sessão expirar
