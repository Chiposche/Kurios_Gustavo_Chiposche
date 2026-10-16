import { expect, type Page } from '@playwright/test'

export const TEST_USER = {
  email: 'contato@email.com',
  password: 'Senha123!',
}

// Reseta o banco de dados simulado para um cenário conhecido.
// Precisa rodar de dentro da página para passar pelo service worker do MSW.
export async function resetScenario(page: Page) {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__reset', { method: 'POST' }))
}

// Faz login pela UI com as credenciais fictícias
export async function login(page: Page) {
  await page.goto('/login')
  await page.locator('input[aria-label="E-mail"]').fill(TEST_USER.email)
  await page.locator('input[aria-label="Senha"]').fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/', { timeout: 10000 })
}

// Clica no botão de compra visível da página de detalhe:
// COMPRAR no desktop, "Comprar NFT" da bottom bar no mobile
export async function clickBuy(page: Page) {
  const desktopBuy = page.getByRole('button', { name: 'COMPRAR', exact: true })
  const mobileBuy = page.getByRole('button', { name: 'Comprar NFT', exact: true })
  // Espera qualquer um dos dois aparecer (o detalhe demora pra carregar)
  await expect(desktopBuy.or(mobileBuy)).toBeVisible({ timeout: 10000 })
  if (await desktopBuy.isVisible().catch(() => false)) {
    await desktopBuy.click()
  } else {
    await mobileBuy.click()
  }
}

// Abre o primeiro NFT do marketplace e adiciona ao carrinho
export async function addFirstNftToCart(page: Page) {
  await page.goto('/marketplace')
  await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
  await page.locator('a[href*="/nft/"]').first().click()
  await page.waitForURL(/\/nft\//)
  // Espera a API confirmar a adição antes de seguir (o alert é dispensado automaticamente)
  const addResponse = page.waitForResponse(
    (r) => r.url().includes('/api/cart/items') && r.request().method() === 'POST',
  )
  await clickBuy(page)
  await addResponse
}

// Preenche o mínimo do checkout e envia o pedido com a carteira indicada
export async function submitCheckout(page: Page, walletName: string) {
  // Espera a cotação carregar antes de prosseguir
  const quoteReady = page.waitForResponse(
    (r) => r.url().includes('/api/cart/quote') && r.request().method() === 'POST' && r.ok(),
  )
  await page.goto('/checkout')
  await quoteReady
  // Escopo em <main> para não capturar o select do rodapé
  await page.locator('main select').first().selectOption('ethereum')
  await page.getByRole('button', { name: walletName }).click()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
}
