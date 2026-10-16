import { test, expect } from '@playwright/test'
import { resetScenario, login, addFirstNftToCart, submitCheckout, clickBuy } from '../helpers/test'

// Testes do fluxo completo de compra
test.describe('Fluxo de compra', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
    await login(page)
  })

  test('compra completa: catálogo → detalhe → carrinho → pagamento → recibo confirmado', async ({ page }) => {
    // 1. Catálogo: escolhe o primeiro NFT
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await page.waitForURL(/\/nft\//)

    // 2. Detalhe: adiciona ao carrinho
    const addResponse = page.waitForResponse(
      (r) => r.url().includes('/api/cart/items') && r.request().method() === 'POST',
    )
    await clickBuy(page)
    await addResponse

    // 3. Carrinho: item presente e resumo visível
    await page.goto('/cart')
    await expect(page.locator('text=Carrinho de NFTs')).toBeVisible()
    await expect(page.locator('text=Resumo da carteira')).toBeVisible()

    // 4. Pagamento: rede, carteira e envio
    await page.click('text=Conectar e finalizar')
    await expect(page).toHaveURL('/checkout')
    await submitCheckout(page, 'MetaMask')

    // 5. Confirmação: pedido confirmado com dados da transação
    await page.waitForURL(/\/orders\//, { timeout: 10000 })
    await expect(page.locator('text=Seus NFTs agora estão na sua carteira')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=ID da transação')).toBeVisible()
    await expect(page.locator('text=Detalhes da transação')).toBeVisible()

    // 6. Após a confirmação, o carrinho foi esvaziado
    await page.goto('/cart')
    await expect(page.locator('text=Seu carrinho está vazio')).toBeVisible({ timeout: 10000 })
  })

  test('pagamento recusado exibe erro e preserva o carrinho', async ({ page }) => {
    // Prepara o carrinho
    await addFirstNftToCart(page)

    // Paga com a carteira de teste que recusa o pagamento
    await page.goto('/cart')
    await page.click('text=Conectar e finalizar')
    await expect(page).toHaveURL('/checkout')
    await submitCheckout(page, 'Carteira de teste')

    // A confirmação mostra o recusa
    await page.waitForURL(/\/orders\//, { timeout: 10000 })
    await expect(page.locator('text=Pagamento recusado')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Voltar ao carrinho')).toBeVisible()

    // O carrinho foi preservado
    await page.goto('/cart')
    await expect(page.locator('text=Resumo da carteira')).toBeVisible()
    await expect(page.locator('text=Carrinho de NFTs')).toBeVisible()
  })
})
