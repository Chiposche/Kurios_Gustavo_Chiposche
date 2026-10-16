import { test, expect, type Page } from '@playwright/test'
import { resetScenario, login, clickBuy } from '../helpers/test'

// Testes de preço alterado em tempo real durante a compra
test.describe('Tempo real: preço alterado durante a compra', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
    await login(page)
  })

  // Dispara o cenário determinístico de mudança de preço (MSW + Socket.IO)
  async function changePrice(page: Page, nftId: string) {
    await page.evaluate(
      (id) =>
        fetch('/api/__scenario/price-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nftId: id }),
        }).then((r) => r.json()),
      nftId,
    )
  }

  // Abre o primeiro NFT do marketplace e devolve o id dele
  async function openFirstNft(page: Page) {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await page.waitForURL(/\/nft\//)
    return new URL(page.url()).pathname.split('/').pop() as string
  }

  test('carrinho: avisa e atualiza o resumo quando o preço muda', async ({ page }) => {
    const nftId = await openFirstNft(page)

    const addResponse = page.waitForResponse(
      (r) => r.url().includes('/api/cart/items') && r.request().method() === 'POST',
    )
    await clickBuy(page)
    await addResponse

    await page.goto('/cart')
    const subtotalRow = page.locator('div.flex.justify-between:has(> span:text-is("Subtotal"))')
    await expect(subtotalRow).toBeVisible()
    const before = await subtotalRow.textContent()

    await changePrice(page, nftId)

    // O evento nft.updated chega pelo socket: aviso visível e resumo já novo
    await expect(page.getByRole('status')).toContainText('Preço de', { timeout: 10000 })
    await expect(page.getByRole('status')).toContainText('O resumo abaixo já foi atualizado')
    await expect(subtotalRow).not.toHaveText(before!)
  })

  test('checkout: bloqueia cotação desatualizada e exige nova confirmação', async ({ page }) => {
    const nftId = await openFirstNft(page)

    const addResponse = page.waitForResponse(
      (r) => r.url().includes('/api/cart/items') && r.request().method() === 'POST',
    )
    await clickBuy(page)
    await addResponse

    // Espera a cotação carregar antes de interagir (o guard exige quote)
    const quoteReady = page.waitForResponse(
      (r) => r.url().includes('/api/cart/quote') && r.request().method() === 'POST' && r.ok(),
    )
    await page.goto('/checkout')
    await quoteReady
    await page.locator('main select').first().selectOption('ethereum')
    await page.getByRole('button', { name: 'MetaMask' }).click()

    const total = page.locator('span.font-mono.font-bold:has-text("ETH")')
    await expect(total).toBeVisible()
    const before = await total.textContent()

    await changePrice(page, nftId)

    // O socket invalida a cotação: o total muda sozinho
    await expect(total).not.toHaveText(before!, { timeout: 10000 })

    // 1ª confirmação: bloqueada com aviso e permanece no checkout
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.locator('text=Cotação mudou durante a navegação')).toBeVisible()
    await expect(page).toHaveURL('/checkout')

    // 2ª confirmação: exige nova confirmação e prossegue com o pedido
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.waitForURL(/\/orders\//, { timeout: 15000 })
  })
})
