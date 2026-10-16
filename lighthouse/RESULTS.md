# Resultados Lighthouse

Auditoria feita em 15/10/2026 com Lighthouse 13.5.0 (CLI), Chrome headless, build de produção com mocks (`VITE_ENABLE_MSW=true`). 3 medições por combinação, mediana reportada.

## Resultados (medianas)

- **Home desktop:** Performance 97, A11y 100, Best Practices 96, SEO 100
- **Home mobile:** Performance 77, A11y 100, Best Practices 96, SEO 100
- **Detalhe desktop:** Performance 85, A11y 100, Best Practices 96, SEO 100
- **Detalhe mobile:** Performance 73, A11y 100, Best Practices 96, SEO 100

## Métricas Web Vitals (medianas)

- **Home desktop:** LCP 0,93s / CLS 0,090 / TBT 10ms
- **Home mobile:** LCP 3,43s / CLS 0,125 / TBT 279ms
- **Detalhe desktop:** LCP 0,98s / CLS 0,261 / TBT 12ms
- **Detalhe mobile:** LCP 3,76s / CLS 0,148 / TBT 300ms

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
