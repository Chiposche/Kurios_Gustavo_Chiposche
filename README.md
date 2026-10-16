# KURIO — NFT Marketplace

Marketplace de NFTs feito em React + TypeScript pro desafio frontend da Jungle Gaming. Tudo roda com mocks (MSW), não precisa de backend.

**Desenvolvido por:** Gustavo Chiposche Pedro

## Stack

| Área | Tecnologia |
| --- | --- |
| Interface | React 19 + TypeScript |
| Roteamento | TanStack Router |
| Estado remoto | TanStack Query |
| HTTP | Axios |
| Estilização | Tailwind CSS + shadcn/ui |
| Mocks | MSW + Socket.IO |
| Testes | Playwright (E2E) + Lighthouse |

Mais detalhes em [ARCHITECTURE.md](ARCHITECTURE.md) e [lighthouse/RESULTS.md](lighthouse/RESULTS.md).

## Como rodar

```bash
npm install
npx playwright install    # só na primeira vez
npm run dev               # http://localhost:5173
```

O MSW liga sozinho em dev — não precisa de nada além disso.

## Credenciais de teste

| E-mail | Senha |
| --- | --- |
| `contato@email.com` | `Senha123!` |
| `kai@email.com` | `Senha456!` |

Cupons: `KURIO10` (10%), `LAUNCH20` (20%), `EXPIRED01` (expirado).

Carteira **"Carteira de teste (recusa o pagamento)"** simula pagamento recusado.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Dev com mocks (porta 5173) |
| `npm run build` | Type check + build em `dist/` |
| `npm run preview` | Serve o build (porta 4173) |
| `npm run test:e2e` | Testes E2E (desktop + mobile) |
| `npm run lighthouse` | Auditoria Lighthouse |

## Cenários de teste

No rodapé do site tem um seletor de rede pra simular condições diferentes:

- **Lenta** — mostra skeletons de loading
- **Erro 500** — mostra mensagem de erro com botão de recarregar
- **Sem conexão** — falha de rede
- **Timeout** — sem resposta por 15s

O botão "Resetar cenário" volta tudo ao normal.

Outros cenários: pagamento recusado (carteira de teste), cupom inválido/expirado, busca sem resultado, e-mail duplicado no cadastro, preço alterado em tempo real.

## Testes E2E

```bash
npm run test:e2e
```

112 testes em Chromium desktop (1440) e mobile (390). Cobre auth, carrinho, checkout, favoritos, 404, cenários de rede, tempo real, acessibilidade e regressão visual.

## Deploy (Vercel)

1. Framework: **Vite**
2. Variável de ambiente: `VITE_ENABLE_MSW=true` (Preview + Production)
3. Desligar Deployment Protection pra o link funcionar sem login da Vercel
4. O `vercel.json` já tem o rewrite SPA

## Estrutura

```
src/        # páginas, componentes, hooks, rotas
mocks/      # handlers MSW, banco em memória, fixtures
e2e/        # testes Playwright
lighthouse/ # config e relatórios
docs/       # enunciado do desafio
```
