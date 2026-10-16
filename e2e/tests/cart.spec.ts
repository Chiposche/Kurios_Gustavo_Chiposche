import { test, expect } from '@playwright/test'

// Testes do fluxo de compra
test.describe('Carrinho e Compra', () => {
  // Faz login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'contato@email.com')
    await page.fill('input[type="password"]', 'Senha123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('deve acessar o carrinho vazio', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('text=Carrinho de NFTs')).toBeVisible()
  })

  test('deve navegar para detalhes de um NFT e ver botão de compra', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await expect(page).toHaveURL(/\/nft\//)
    // Deve ter um botão de comprar visível (COMPRAR no desktop, bottom bar no mobile)
    const desktopBuy = page.getByRole('button', { name: 'COMPRAR', exact: true })
    const mobileBuy = page.getByRole('button', { name: 'Comprar NFT', exact: true })
    await expect(desktopBuy.or(mobileBuy)).toBeVisible({ timeout: 5000 })
  })

  test('deve exibir a página 404 para rotas inexistentes', async ({ page }) => {
    await page.goto('/pagina-que-nao-existe')
    await expect(page.locator('text=404')).toBeVisible()
  })
})
