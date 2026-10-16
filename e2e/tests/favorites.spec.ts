import { test, expect } from '@playwright/test'
import { resetScenario, login } from '../helpers/test'

// Testes de favoritos
test.describe('Favoritos', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
    await login(page)
  })

  test('favoritar no detalhe persiste após refresh e pode desfavoritar', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await page.waitForURL(/\/nft\//)

    // Favorita (usa :visible porque existem botões para desktop e mobile)
    // Espera a API confirmar antes de seguir - o visual muda de forma otimista
    const addResponse = page.waitForResponse(
      (r) => r.url().includes('/api/favorites/') && r.request().method() === 'POST',
    )
    await page.locator('button[aria-label="Adicionar aos favoritos"]:visible').click()
    await addResponse
    await expect(page.locator('button[aria-label="Remover dos favoritos"]:visible')).toBeVisible({ timeout: 5000 })

    // Persiste após refresh
    await page.reload()
    await expect(page.locator('button[aria-label="Remover dos favoritos"]:visible')).toBeVisible({ timeout: 10000 })

    // Desfavorita
    const removeResponse = page.waitForResponse(
      (r) => r.url().includes('/api/favorites/') && r.request().method() === 'DELETE',
    )
    await page.locator('button[aria-label="Remover dos favoritos"]:visible').click()
    await removeResponse
    await expect(page.locator('button[aria-label="Adicionar aos favoritos"]:visible')).toBeVisible({ timeout: 5000 })
  })

  test('favoritar pelo card do marketplace', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    const firstCard = page.locator('a[href*="/nft/"]').first()

    // O coração do card fica preenchido após favoritar
    await firstCard.locator('button[aria-label="Favoritar"]:visible').click()
    await expect(firstCard.locator('button[aria-label="Remover dos favoritos"]:visible')).toBeVisible({ timeout: 5000 })
  })

  test('página de favoritos lista os NFTs e atualiza ao desfavoritar', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    const firstCard = page.locator('a[href*="/nft/"]').first()

    // Favorita pelo card e espera a API confirmar
    const addResponse = page.waitForResponse(
      (r) => r.url().includes('/api/favorites/') && r.request().method() === 'POST',
    )
    await firstCard.locator('button[aria-label="Favoritar"]:visible').click()
    await addResponse

    // A página de favoritos mostra o NFT
    await page.goto('/favorites')
    await expect(page.locator('text=1 NFT(s)')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('a[href*="/nft/"]').first()).toBeVisible()

    // Desfavorita pelo card do marketplace
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    const removeResponse = page.waitForResponse(
      (r) => r.url().includes('/api/favorites/') && r.request().method() === 'DELETE',
    )
    await page.locator('a[href*="/nft/"]').first().locator('button[aria-label="Remover dos favoritos"]:visible').click()
    await removeResponse

    // A página de favoritos volta a ficar vazia
    await page.goto('/favorites')
    await expect(page.locator('text=Você ainda não favoritou nenhum NFT')).toBeVisible({ timeout: 10000 })
  })
})
