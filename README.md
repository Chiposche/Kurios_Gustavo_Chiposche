# KURIO — NFT Marketplace

Marketplace de NFTs feito em React + TypeScript pro desafio frontend da Jungle Gaming. Tudo roda com mocks (MSW), não precisa de backend.

**Desenvolvido por:** Gustavo Chiposche Pedro

## Como rodar

```bash
npm install
npx playwright install    # só na primeira vez, pra rodar os testes E2E
npm run dev               # http://localhost:5173
```

O MSW liga sozinho em dev — não precisa de nada além disso.

## Variáveis de ambiente

- `VITE_ENABLE_MSW=true` — liga os mocks no build de produção. Em dev é automático.

Coloca no `.env.local` ou direto na Vercel.

## Credenciais de teste

- `contato@email.com` / `Senha123!`
- `kai@email.com` / `Senha456!`

Cupons: `KURIO10` (10%), `LAUNCH20` (20%), `EXPIRED01` (expirado).

Carteira **"Carteira de teste (recusa o pagamento)"** simula pagamento recusado.

## Cenários de rede

No rodapé do site tem um seletor de rede pra simular condições diferentes:

- **Normal** — tudo funciona normal
- **Lenta** — mostra skeletons de loading
- **Erro 500** — mostra mensagem de erro com botão de recarregar
- **Sem conexão** — falha de rede
- **Timeout** — sem resposta por 15s

O botão "Resetar cenário" volta tudo ao normal (dados e rede).

## Comandos

- `npm run dev` — dev com mocks (porta 5173)
- `npm run build` — type check + build em `dist/`
- `npm run preview` — serve o build (porta 4173)
- `npm run typecheck` — só verificação de tipos
- `npm run lint` — lint (oxlint)
- `npm run test:e2e` — testes E2E (desktop + mobile)
- `npm run test:e2e:ui` — testes E2E em modo interativo
- `npm run lighthouse` — auditoria Lighthouse

## Como reproduzir os fluxos de falha

- **Loading lento:** rodapé → rede "Lenta" → abrir catálogo
- **Erro 500:** rodapé → rede "Erro 500" → catálogo. Volta pra "Normal" e clica "Recarregar"
- **Sem conexão:** rodapé → rede "Sem conexão" → catálogo
- **Pagamento recusado:** checkout → escolher carteira "Carteira de teste"
- **Cupom inválido:** carrinho → digitar "EXPIRED01" ou qualquer texto
- **Busca vazia:** catálogo → buscar "zzz"
- **404:** abrir /nft/nft-9999 ou /abc
- **E-mail duplicado:** cadastro com contato@email.com
- **Preço alterado em tempo real:** ter um NFT no carrinho e esperar ~30s, o socket muda o preço sozinho. No carrinho aparece um aviso e no checkout bloqueia a cotação desatualizada
- **Troca de usuário:** logar como nova.sato, ver carrinho, logout e entrar como kai.tanaka — nada do anterior aparece
- **Reset:** rodapé → "Resetar cenário de teste"
