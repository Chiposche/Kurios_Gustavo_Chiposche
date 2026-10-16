import { test, expect } from '@playwright/test'
import { resetScenario } from '../helpers/test'

// Filtros do catálogo na URL, sobrevivem refresh
test.describe('Catálogo - filtros na URL', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
  })

  test('paginação fica na URL e sobrevive a refresh', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })

    // Clica na página 2 e espera a API receber page=2
    const pageTwo = page.waitForResponse(
      (r) => r.url().includes('/api/nfts') && r.url().includes('page=2'),
    )
    await page.getByRole('button', { name: '2', exact: true }).click()
    await pageTwo
    await expect(page).toHaveURL(/page=2/)

    // Depois do refresh a página continua sendo a 2
    const pageTwoAfterReload = page.waitForResponse(
      (r) => r.url().includes('/api/nfts') && r.url().includes('page=2'),
    )
    await page.reload()
    await pageTwoAfterReload
    await expect(page).toHaveURL(/page=2/)
  })

  test('categoria vai para a URL e volta pelo histórico', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })

    // No mobile os filtros ficam no drawer - abre se o botão da categoria não estiver visível
    const categoryButton = page
      .locator('button', { hasText: 'Arte digital' })
      .filter({ visible: true })
      .first()
    let openedDrawer = false
    if ((await categoryButton.count()) === 0) {
      await page.locator('button', { hasText: 'Filtros' }).filter({ visible: true }).first().click()
      openedDrawer = true
    }

    // Espera a API receber o filtro de categoria
    const categoryRequest = page.waitForResponse(
      (r) => r.url().includes('/api/nfts') && r.url().includes('category='),
    )
    await categoryButton.click()
    await categoryRequest
    await expect(page).toHaveURL(/category=/)

    // Fecha o drawer para não cobrir os cards
    if (openedDrawer) {
      await page.getByRole('button', { name: 'Fechar filtros' }).click()
    }

    // Abre um NFT e volta: o filtro é restaurado pelo histórico
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await page.waitForURL(/\/nft\//)
    await page.goBack()
    await expect(page).toHaveURL(/category=/)
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
  })
})
