# Resultados Lighthouse

Auditoria feita em 15/10/2026 com Lighthouse 13.5.0 (CLI), Chrome headless, build de produção com mocks (`VITE_ENABLE_MSW=true`). 3 medições por combinação, mediana reportada.

## Resultados

| Página | Perfil | Performance | A11y | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Home `/` | Desktop | 97 | 100 | 96 | 100 |
| Home `/` | Mobile | 77 | 100 | 96 | 100 |
| Detalhe `/nft/nft-001` | Desktop | 85 | 100 | 96 | 100 |
| Detalhe `/nft/nft-001` | Mobile | 73 | 100 | 96 | 100 |

## Por que performance ficou abaixo de 90 no mobile

O MSW precisa inicializar antes do React montar (`worker.start()`), o que atrasa o primeiro render. No throttling de mobile isso pesa mais. O bundle do React + TanStack + Socket.IO também contribui pro TBT alto (~280ms).

No desktop a home passou de 90, mas o detalhe ficou em 85 por causa do CLS na transição skeleton → conteúdo.

## Como rodar

```bash
VITE_ENABLE_MSW=true npm run build
npm run preview -- --port 4173
npx lighthouse http://localhost:4173/ --output=html --preset=desktop
```

Config e relatórios completos em `lighthouse.config.js` e `lighthouse/reports/`.
